<?php

$content = file_get_contents('.txt');

$handle = fopen("cities1000.txt", "r");
if ($handle) {

    $con=mysqli_connect("localhost","runnersweb","runnersweb","runnersweb");

    //mysqli_query($con, "SET NAMES 'utf8'");
    //mysqli_query($con, "SET CHARACTER SET utf8");

    mysqli_set_charset($con, "utf8");

    $count=0;
    while ($line = fgets($handle)) {
        $count++;

        $fields = explode("\t", $line);



        $town = $fields[1];
        $townNames = $fields[3];

        if(strlen($townNames)>0){
            $townNames = ','.$townNames;
        }
        $lat = (float)$fields[4];
        $lon = (float)$fields[5];
        $countryCode = $fields[8];
        $state = $fields[10];
        $population = (int)$fields[14];
        $timezone = $fields[17];
        $updated = $fields[18];

        if($state == $countryCode) {
            $state = "";
        }

        $res = mysqli_query($con, "SELECT * FROM country where country_code=\"$countryCode\"");
        if(mysqli_num_rows($res)==0) {
            mysqli_query($con,"INSERT IGNORE INTO country (name, country_code) VALUES (\"$countryCode\", \"$countryCode\")");
        }

        mysqli_query($con,"INSERT IGNORE INTO location
            (town, town_lang, latitude, longitude, population, timezone, updated, `state`, country_id)
           VALUES
            (\"$town\", \"$townNames\", $lat, $lon, $population, \"$timezone\", \"$updated\", \"$state\", ( SELECT id FROM country WHERE country_code=\"$countryCode\"))
        ");


    }
    echo "  " +$count;
}



?>