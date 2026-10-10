<?php
require_once __DIR__.'/erp_common.php';
if (!$can_write) core_fail(403,'La documentación privada requiere permisos de Administración o Dirección.');
if (!in_array($_SERVER['REQUEST_METHOD'],['GET','POST'],true)) core_fail(405,'Método no permitido');
function doc_id($id) { if (!is_string($id)||!preg_match('/^[a-f0-9-]{36}$/i',$id)) core_fail(400,'Identificador inválido'); return $id; }
function doc_get($id) {
 global $org_id;
 $rows=erp_rest('GET','service_documents?organization_id=eq.'.rawurlencode($org_id).'&id=eq.'.doc_id($id).'&select=*');
 if (!isset($rows[0])) core_fail(404,'Documento no encontrado');
 return $rows[0];
}
function doc_html($d) {
 $s=$d['signed_snapshot'];$e=function($v){return htmlspecialchars((string)$v,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8');};
 return '<!doctype html><html lang="es"><meta charset="utf-8"><title>'.$e($s['title']).'</title><style>body{font:16px system-ui;max-width:800px;margin:40px auto;padding:20px}pre{white-space:pre-wrap;font:inherit}img{max-width:500px}small{overflow-wrap:anywhere}</style><h1>'.$e($s['title']).'</h1><pre>'.$e($s['content']).'</pre><hr><p>Firmante: '.$e($s['signer']).'</p><p>'.$e($s['consent']).'</p><img alt="Firma" src="'.$e($s['signature']).'"><p>Firmado: '.$e($s['signedAt']).'</p><small>Documento '.$e($s['documentId']).' · Revisión '.$e($s['revision']).' · SHA-256 '.$e($d['signature_hash']).'</small></html>';
}
if ($_SERVER['REQUEST_METHOD']==='GET') {
 if (isset($_GET['id'])) {
  $d=doc_get($_GET['id']);
  if (isset($_GET['download'])) {
   if ($d['status']!=='signed') core_fail(409,'El documento todavía no está firmado.');
   header('Content-Type: text/html; charset=utf-8');header('Content-Disposition: attachment; filename="documento-'.$d['id'].'.html"');header("Content-Security-Policy: default-src 'none'; img-src data:; style-src 'unsafe-inline'; sandbox");
   echo doc_html($d);exit;
  }
  $d['deliveries']=erp_rest('GET','document_deliveries?document_id=eq.'.$d['id'].'&select=id,recipient,state,attempted_at');
  $d['versions']=erp_rest('GET','document_versions?document_id=eq.'.$d['id'].'&select=revision,actor,created_at&order=revision.desc');
  echo json_encode($d,JSON_UNESCAPED_UNICODE);exit;
 }
 $query='service_documents?organization_id=eq.'.rawurlencode($org_id).'&select=id,title,category,service_code,entity_type,entity_id,status,revision,updated_at&order=updated_at.desc&limit=500';
 if (!empty($_GET['service'])) $query.='&service_code=eq.'.rawurlencode(substr($_GET['service'],0,80));
 echo json_encode(['documents'=>erp_rest('GET',$query)],JSON_UNESCAPED_UNICODE);exit;
}
$raw=file_get_contents('php://input',false,null,0,500001);
if(strlen($raw)>500000)core_fail(413,'Documento demasiado grande');
$b=json_decode($raw,true);if(!is_array($b)||array_is_list($b))core_fail(400,'Datos inválidos');
$action=$b['action']??'';
if(!in_array($action,['create','update','review','sign','send'],true))core_fail(400,'Acción inválida');
if($action!=='send') {
 if($action==='sign') {
  if(!is_string($b['signature']??null)||!str_starts_with($b['signature'],'data:image/png;base64,')||strlen($b['signature'])>300000)core_fail(400,'Firma inválida');
  if(!is_array($b['recipients']??null)||!array_is_list($b['recipients'])||count($b['recipients'])>10)core_fail(400,'Indica una lista de hasta diez destinatarios');
  $image=base64_decode(substr($b['signature']??'',22),true);
  if($image===false||substr($image,0,8)!=="\x89PNG\r\n\x1a\n")core_fail(400,'Firma inválida');
  foreach(($b['recipients']??[]) as $email)if(!is_string($email)||!filter_var($email,FILTER_VALIDATE_EMAIL))core_fail(400,'Correo inválido');
 }
 $d=erp_rest('POST','rpc/document_action',['p_org'=>$org_id,'p_actor'=>$actor,'p_action'=>$action,'p_body'=>$b]);
 if($action!=='sign'){echo json_encode($d,JSON_UNESCAPED_UNICODE);exit;}
} else $d=doc_get($b['id']??'');
if($d['status']!=='signed')core_fail(409,'Firma el documento antes de enviar copias.');
// Atomically claim deliveries; uncertain sends are never automatically repeated.
$deliveries=erp_rest('GET','document_deliveries?document_id=eq.'.$d['id'].'&state=in.(pending,failed)&select=id,recipient');
$from=$env['DOCUMENTS_MAIL_FROM']??'conta@innovandesign.com';
if(!filter_var($from,FILTER_VALIDATE_EMAIL))core_fail(503,'Remitente sin configurar');
$html=doc_html($d);
foreach($deliveries as $delivery) {
 $claim=doc_claim($delivery['id']);if(!$claim)continue;
 $boundary=bin2hex(random_bytes(16));
 $headers='From: INNOVA <'.$from.">\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=\"".$boundary.'"';
 $message='--'.$boundary."\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\nAdjuntamos la copia del documento firmado.\r\n\r\n--".$boundary."\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Disposition: attachment; filename=\"documento-firmado.html\"\r\nContent-Transfer-Encoding: base64\r\n\r\n".chunk_split(base64_encode($html)).'--'.$boundary."--\r\n";
 $accepted=@mail($delivery['recipient'],'Copia del documento firmado - INNOVA',$message,$headers);
 doc_delivery_result($delivery['id'],$accepted?'accepted':'failed');
}
echo json_encode(['document'=>$d,'deliveries'=>erp_rest('GET','document_deliveries?document_id=eq.'.$d['id'].'&select=id,recipient,state,attempted_at')],JSON_UNESCAPED_UNICODE);
// PATCH requires Prefer:return=representation; erp_rest intentionally doesn't set that header.
function doc_delivery_request($id,$body,$filter='') {
 global $env;
 $key=$env['SUPABASE_SECRET_KEY']??$env['SUPABASE_SERVICE_ROLE_KEY']??'';
 $h=['apikey: '.$key,'Accept-Profile: innova','Content-Profile: innova','Content-Type: application/json','Prefer: return=representation'];
 if(strpos($key,'eyJ')===0)$h[]='Authorization: Bearer '.$key;
 $url=rtrim($env['SUPABASE_URL'],'/').'/rest/v1/document_deliveries?id=eq.'.doc_id($id).$filter;
 $c=curl_init($url);curl_setopt_array($c,[CURLOPT_CUSTOMREQUEST=>'PATCH',CURLOPT_RETURNTRANSFER=>true,CURLOPT_HTTPHEADER=>$h,CURLOPT_POSTFIELDS=>json_encode($body),CURLOPT_TIMEOUT=>15]);
 $raw=curl_exec($c);$status=curl_getinfo($c,CURLINFO_HTTP_CODE);curl_close($c);
 if($status!==200||$raw===false)core_fail(503,'Documento guardado. No se pudo confirmar el estado del envío.');
 return json_decode($raw,true);
}
function doc_claim($id){return count(doc_delivery_request($id,['state'=>'sending','attempted_at'=>gmdate('c')],'&state=in.(pending,failed)'))===1;}
function doc_delivery_result($id,$state){doc_delivery_request($id,['state'=>$state]);}
