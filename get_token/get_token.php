<?php
header("Access-Control-Allow-Origin: *");
session_start();
require_once('./gis-wrapper/AuthProviderUser.php');
require_once('./gis-wrapper/GIS.php');
error_reporting(0);
$user = new \GIS\AuthProviderUser("YourEXPALogin", "YourEXPAPassword");
$gis = new \GIS\GIS($user);
foreach($gis->current_person as $p) {
    #echo $p->person->full_name . "\n";
}
$token = $_SESSION["token"];
echo $token;
?>
