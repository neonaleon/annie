<?php

class Annie {

  private static $url = 'http://10.25.11.45:8000/api';
  private static $apiKey = '';

  public static function init($apiKey){
    self::$apiKey = $apiKey;
  }

  public static function page($name){

  }

  public static function track($event, $data = array()){
    $endpoint = self::$url . '/track';
    $outbound = json_encode(array(
      'event' => $event,
      'data' => $data,
      'timestamp' => date(DATE_ISO8601, time()) // iso8601
    ));

    $context = stream_context_create(array(
      'http' => array(
        'method' => 'POST',
        'header' => 'Content-Type: application/json',
        'content' => $outbound
      )
    ));

    $result = file_get_contents($endpoint, false, $context);

    // TODO: add a callback or something
    // might need to make a queue and run a background task, since if the page
    // changes, the requests get cancelled?
    // API might timeout too...
  }

  public static function identify($user, $data){

  }
}