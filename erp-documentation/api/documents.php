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
// Presentation only: the signed snapshot and its integrity hash remain unchanged.
function doc_escape($v) { return htmlspecialchars((string)$v,ENT_QUOTES|ENT_SUBSTITUTE,'UTF-8'); }
function doc_brand() {
 return '<table role="presentation" cellspacing="0" cellpadding="0"><tr><td style="width:44px;height:44px;text-align:center;vertical-align:middle;border-radius:10px;background:#06b6d4;background:linear-gradient(135deg,#06b6d4,#2563eb);color:#090a0f;font:bold 26px Arial">I</td><td style="padding-left:12px;color:#f3f4f6;font:bold 20px Arial;letter-spacing:.3px">INNOVA <span style="color:#22d3ee">&amp;</span> DESIGN</td></tr></table>';
}
function doc_html($d) {
 $s=$d['signed_snapshot'];$e='doc_escape';
 return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'.$e($s['title']).'</title><style>
 *{box-sizing:border-box}body{margin:0;background:#eef2f6;color:#172333;font:15px/1.7 Arial,sans-serif}.sheet{max-width:850px;margin:32px auto;background:white;border:1px solid #dce5ed}.brand{padding:28px 36px;background:#0d0f17;border-bottom:4px solid #06b6d4}.brand p{margin:14px 0 0;color:#cbd5e1;font-size:11px;letter-spacing:2px;text-transform:uppercase}.main{padding:32px 36px}h1{font-size:27px;line-height:1.3;margin:8px 0 28px;color:#0f253c}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;margin:0}.eyebrow{color:#087f96;font-size:11px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase}.signature{margin-top:32px;padding-top:20px;border-top:2px solid #06b6d4;break-inside:avoid}.signature h2{font-size:18px}.signature img{display:block;width:350px;max-width:100%;height:auto;border:1px solid #e2e8f0;background:white}.signature p{margin:8px 0}.integrity{font-size:10px;color:#526477;overflow-wrap:anywhere;background:#f3f7fa;padding:14px;margin-top:20px}.footer{padding:20px 36px;border-top:1px solid #dce5ed;font-size:11px;color:#526477}.footer a{color:#087f96;text-decoration:none}@media(max-width:600px){.sheet{margin:0;border:0}.brand,.main,.footer{padding:22px}h1{font-size:23px}}@media print{@page{size:A4;margin:16mm}body{background:white;font-size:11pt}.sheet{border:0;margin:0;max-width:none}.brand{print-color-adjust:exact;-webkit-print-color-adjust:exact}.main{padding:24px 0}.footer{padding:16px 0}h1{break-after:avoid}}
 </style></head><body><article class="sheet"><header class="brand">'.doc_brand().'<p>Soluciones digitales · IA &amp; automatización</p></header><main class="main"><div class="eyebrow">Copia del documento firmado</div><h1>'.$e($s['title']).'</h1><pre>'.$e($s['content']).'</pre><section class="signature"><h2>Conformidad y firma</h2><p><strong>Firmante:</strong> '.$e($s['signer']).'</p><p>'.$e($s['consent']).'</p><img alt="Firma manuscrita registrada" src="'.$e($s['signature']).'"><p><strong>Fecha de firma:</strong> '.$e($s['signedAt']).'</p></section><div class="integrity">Documento '.$e($s['documentId']).' · Revisión '.$e($s['revision']).'<br>SHA-256: '.$e($d['signature_hash']).'<br>Esta copia reproduce el contenido firmado. La identidad gráfica no modifica el texto, la firma ni su registro.</div></main><footer class="footer"><strong>INNOVA &amp; DESIGN</strong> · Benidorm, Costa Blanca<br><a href="https://innovandesign.com">innovandesign.com</a> · <a href="mailto:conta@innovandesign.com">conta@innovandesign.com</a></footer></article></body></html>';
}
function doc_mail_html($d) {
 $s=$d['signed_snapshot'];$e='doc_escape';
 return '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:24px 12px;background:#eef2f6;font:15px/1.6 Arial,sans-serif;color:#172333"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:640px;margin:auto;background:white;border:1px solid #dce5ed"><tr><td style="padding:28px;background:#0d0f17;border-bottom:4px solid #06b6d4">'.doc_brand().'</td></tr><tr><td style="padding:28px"><p style="color:#087f96;font-size:12px;font-weight:bold;letter-spacing:1px">DOCUMENTACIÓN · COPIA FIRMADA</p><h1 style="font-size:25px;line-height:1.3;color:#0f253c">Tu documento, firmado y guardado.</h1><p>Adjuntamos la copia íntegra de <strong>'.$e($s['title']).'</strong>, con el texto aceptado y la firma registrada.</p><p style="padding:16px;background:#f3f7fa;border-left:3px solid #06b6d4"><strong>Firmante:</strong> '.$e($s['signer']).'<br><strong>Fecha:</strong> '.$e($s['signedAt']).'</p><p>Abre <strong>documento-firmado.html</strong> en tu navegador. Puedes conservarlo, imprimirlo o guardarlo como PDF desde la opción de impresión.</p><p>Si necesitas una aclaración, responde a este correo.</p><p style="font-size:11px;color:#526477;overflow-wrap:anywhere">Referencia: '.$e($s['documentId']).' · Revisión '.$e($s['revision']).'</p></td></tr><tr><td style="padding:20px 28px;border-top:1px solid #dce5ed;font-size:12px;color:#526477"><strong>INNOVA &amp; DESIGN</strong><br>Soluciones digitales · IA &amp; automatización<br><a style="color:#087f96" href="https://innovandesign.com">innovandesign.com</a> · <a style="color:#087f96" href="mailto:conta@innovandesign.com">conta@innovandesign.com</a><br>Benidorm · Costa Blanca</td></tr></table></body></html>';
}
function doc_mail_message($d,$boundary) {
 $alternative=$boundary.'-alt';
 $plain="Adjuntamos la copia del documento firmado: ".$d['signed_snapshot']['title']."\r\nAbre documento-firmado.html en tu navegador para leerlo o imprimirlo.\r\n\r\nINNOVA & DESIGN\r\nhttps://innovandesign.com\r\nconta@innovandesign.com";
 return '--'.$boundary."\r\nContent-Type: multipart/alternative; boundary=\"".$alternative."\"\r\n\r\n--".$alternative."\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n".chunk_split(base64_encode($plain)).'--'.$alternative."\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n".chunk_split(base64_encode(doc_mail_html($d))).'--'.$alternative."--\r\n\r\n--".$boundary."\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Disposition: attachment; filename=\"documento-firmado.html\"\r\nContent-Transfer-Encoding: base64\r\n\r\n".chunk_split(base64_encode(doc_html($d))).'--'.$boundary."--\r\n";
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
 if (!empty($_GET['service'])) {
  $service=substr($_GET['service'],0,80);
  if(!preg_match('/^[A-Za-z0-9_-]+$/',$service))core_fail(400,'Código de servicio inválido');
  $query.='&or=(service_code.eq.'.rawurlencode($service).',entity_type.eq.plantilla)';
 }
 echo json_encode(['documents'=>erp_rest('GET',$query)],JSON_UNESCAPED_UNICODE);exit;
}
$raw=file_get_contents('php://input',false,null,0,500001);
if(strlen($raw)>500000)core_fail(413,'Documento demasiado grande');
$b=json_decode($raw,true);if(!is_array($b)||array_is_list($b))core_fail(400,'Datos inválidos');
$action=$b['action']??'';
if(!in_array($action,['create','update','review','sign','send'],true))core_fail(400,'Acción inválida');
if($action!=='send') {
 if(in_array($action,['review','sign'],true)) {
  $ready=doc_get($b['id']??'');
  if($ready['entity_type']==='plantilla')core_fail(409,'Crea una copia del modelo para completar y firmar.');
  if(preg_match('/\{\{[A-Z0-9_]+\}\}/',$ready['content']))core_fail(409,'Completa los datos pendientes antes de dar conformidad o firmar.');
 }
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
foreach($deliveries as $delivery) {
 $claim=doc_claim($delivery['id']);if(!$claim)continue;
 $boundary=bin2hex(random_bytes(16));
 $headers='From: INNOVA <'.$from.">\r\nMIME-Version: 1.0\r\nContent-Type: multipart/mixed; boundary=\"".$boundary.'"';
 $message=doc_mail_message($d,$boundary);
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
 $url=rtrim($env['SUPABASE_URL']??'https://skgpjovfkcpyenipjlxh.supabase.co','/').'/rest/v1/document_deliveries?id=eq.'.doc_id($id).$filter;
 $c=curl_init($url);curl_setopt_array($c,[CURLOPT_CUSTOMREQUEST=>'PATCH',CURLOPT_RETURNTRANSFER=>true,CURLOPT_HTTPHEADER=>$h,CURLOPT_POSTFIELDS=>json_encode($body),CURLOPT_TIMEOUT=>15]);
 $raw=curl_exec($c);$status=curl_getinfo($c,CURLINFO_HTTP_CODE);curl_close($c);
 if($status!==200||$raw===false)core_fail(503,'Documento guardado. No se pudo confirmar el estado del envío.');
 return json_decode($raw,true);
}
function doc_claim($id){return count(doc_delivery_request($id,['state'=>'sending','attempted_at'=>gmdate('c')],'&state=in.(pending,failed)'))===1;}
function doc_delivery_result($id,$state){doc_delivery_request($id,['state'=>$state]);}
