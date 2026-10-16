<?php
require_once __DIR__ . '/erp_common.php';
$method = $_SERVER['REQUEST_METHOD'] ?? '';
$route = $_GET['view'] ?? 'summary';
if ($route === 'demos' && strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') core_fail(415, 'Se requiere application/json');
$routes = ['summary'=>'/captacion','evidence'=>'/captacion/evidence','escaparates'=>'/captacion/escaparates','commands'=>'/captacion/commands','proposals'=>'/captacion/proposals','demos'=>'/captacion/demos'];
if (!is_string($route) || !isset($routes[$route])) core_fail(404, 'Vista no disponible');
if ($method !== (in_array($route,['commands','proposals','demos'],true) ? 'POST' : 'GET')) core_fail(405, 'Metodo no permitido');
if (in_array($route,['commands','proposals','demos'],true) && !$can_write) core_fail(403, 'Sin permiso de escritura');
if (!is_int($session['exp'] ?? null) || $session['exp']<=time() || ($membership['active'] ?? false)!==true) core_fail(401,'Sesion no activa');
$length = $_SERVER['CONTENT_LENGTH'] ?? '0';
if (!ctype_digit((string)$length) || (int)$length > 16384 || isset($_SERVER['HTTP_TRANSFER_ENCODING'])) core_fail(413, 'Solicitud demasiado grande');
$body = $method === 'POST' ? file_get_contents('php://input', false, null, 0, 16385) : '';
if (strlen($body) > 16384) core_fail(413, 'Solicitud demasiado grande');
$key=$env['SUPABASE_SECRET_KEY'] ?? $env['SUPABASE_SERVICE_ROLE_KEY'] ?? '';
if (!$key) core_fail(503,'Core no configurado');
$input=json_encode(['method'=>$method,'path'=>$routes[$route],'body'=>$body,'core_key'=>$key,
    'session'=>['organization_id'=>$org_id,'actor_id'=>$actor,'role'=>$membership['role'],
                'active'=>true,'expires_at'=>$session['exp']]],JSON_THROW_ON_ERROR);
$entry=dirname(__DIR__,3).'/innova-private/captacion-v1/hostinger_stdio.py';
if (!is_file($entry)) core_fail(503,'Motor de captacion no publicado');
$process=proc_open(['/opt/alt/python311/bin/python3','-B',$entry],
    [0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']],$pipes);
if (!is_resource($process)) core_fail(503,'Motor no disponible');
fwrite($pipes[0],$input);fclose($pipes[0]);unset($input,$key);
stream_set_blocking($pipes[1],false);stream_set_blocking($pipes[2],false);
$output='';$deadline=microtime(true)+28;$failed=false;
while(true){
    $output.=stream_get_contents($pipes[1]);stream_get_contents($pipes[2]);
    if(strlen($output)>2097152 || microtime(true)>$deadline){$failed=true;proc_terminate($process);break;}
    if(!proc_get_status($process)['running']){ $output.=stream_get_contents($pipes[1]);break; }
    usleep(10000);
}
fclose($pipes[1]);fclose($pipes[2]);proc_close($process);
if(strlen($output)>2097152)$failed=true;
$result=json_decode($output,true);
if($failed || !is_array($result) || !is_int($result['status']??null) || !is_array($result['body']??null)) core_fail(503,'Captacion no disponible; operacion no confirmada');
http_response_code($result['status']);echo json_encode($result['body']);
