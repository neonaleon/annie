<?php

class Annie {

  // private static $url = 'http://kts-leonho/annie/api';
  private static $url = 'http://10.25.11.45:8000/api';
  private static $apiKey = '';
  private static $init = false;

  public static function init($apiKey){
    self::$apiKey = $apiKey;
    self::$init = true;
  }

  public static function track($event, $data = array()){
    if (!self::$init){
      throw new Exception('Annie - apiKey not set, call init("YOUR-API-KEY") first!');
      return;
    }
    $endpoint = self::$url . '/track';
    $outbound = json_encode(array(
      'event' => $event,
      'data' => $data,
      'timestamp' => date(DATE_ISO8601, time()) // iso8601 is mongo's time format
    ));

    $ch = curl_init($endpoint);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
      'Content-Type: application/json',
      'Content-Length: ' . strlen($outbound),
      'X-API-KEY: ' . self::$apiKey
    ));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $outbound);
    $response = curl_exec($ch);
    curl_close($ch);
    return $response;
  }
}