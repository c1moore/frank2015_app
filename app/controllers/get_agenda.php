<?php

// ini_set('display_errors',1);
// ini_set('display_startup_errors',1);
// error_reporting(-1);

	/**
	* This controller will return all events in the database that start after the date specified by
	* start_date.  If start_date is not specified and end_date is specified, all events before the
	* specified time will be returned.  If neither are specified, an error will result.
	*
	* @param start_date (optional) - earliest date in milliseconds that should be returned
	* @param end_date (optional) - the last date in milliseconds that should be returned
	*
	* @return an array of objects with the following fields:
	* 	name - event name
	* 	start_time - time the event starts (in milliseconds)
	*	end_time - time the event ends (in milliseconds)
	* 	locattion - location of the event
	* 	type - specifies whether the event is an all day event (`allday`) or only takes a fraction
	*      of the day (`hourly`)
	*/

	$_POST = json_decode(file_get_contents("php://input"), true);

	//Make sure user is an authenticated user.
	/*$send_response_on_success = false;
	require './check_credentials.php';*/

	include_once "../storage_info.php";

	$conn = mysqli_connect(HOST, USER, PASS, NAME);

	$events = array();

	if(!mysqli_connect_error()) {
		if(isset($_POST['start_date']) && is_numeric($_POST['start_date'])) {
			if($stmt = mysqli_prepare($conn, "SELECT name, start_time, end_time, location, type FROM Events WHERE start_time > ?")) {
				mysqli_stmt_bind_param($stmt, "i", $_POST['start_date']);

				if(mysqli_stmt_execute($stmt)) {
					mysqli_stmt_bind_result($stmt, $rname, $rstart_time, $rend_time, $rlocation, $rtype);

					while(mysqli_stmt_fetch($stmt)) {
						$event = array();
						$event['name'] = $rname;
						$event['start_time'] = $rstart_time;
						$event['end_time'] = $rend_time;
						$event['location'] = $rlocation;
						$event['type'] = $rtype;

						array_push($events, $event);
					}

					header('HTTP/1.1 200 OK', true, 200);
					echo json_encode($events);
					exit();
				}
			}
		} else if(isset($_POST['end_date']) && is_numeric($_POST['end_date'])) {
			if($stmt = mysqli_prepare($conn, "SELECT name, start_time, end_time, location, type FROM Events WHERE end_time < ?")) {
				mysqli_stmt_bind_param($stmt, "i", $_POST['end_date']);

				if(mysqli_stmt_execute($stmt)) {
					mysqli_stmt_bind_result($stmt, $rname, $rstart_time, $rend_time, $rlocation, $rtype);

					while(mysqli_stmt_fetch($stmt)) {
						$event = array();
						$event['name'] = $rname;
						$event['start_time'] = $rstart_time;
						$event['end_time'] = $rend_time;
						$event['location'] = $rlocation;
						$event['type'] = $rtype;

						array_push($events, $event);
					}

					header('HTTP/1.1 200 OK', true, 200);
					echo json_encode($events);
					exit();
				}
			}
		} else {
			header('HTTP/1.1 404 Bad request.', true, 404);
			$data = array();
			$data['message'] = 'Bad request.';
			echo json_encode($data);
			exit();
		}
	} else {
		header("HTTP/1.1 500 Failed to connect to database.", true, 500);
		$data = array();
		$data['message'] = "Failed to connect to database.";
		echo json_encode($data);
		exit();
	}

	header("HTTP/1.1 200 OK", true, 200);
	$attendees = array_values($attendees);
	echo json_encode($attendees);
	exit();
?>