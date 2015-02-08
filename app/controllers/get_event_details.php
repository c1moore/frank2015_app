<?php

// ini_set('display_errors',1);
// ini_set('display_startup_errors',1);
// error_reporting(-1);

	/**
	* This returns all events in the Huddle table given a id with which to query.  If no id is
	* specified, 400 is returned.
	*
	* @param event_id - id for the Huddle to return all specifid topics.
	*
	* @return an array of objects with following format:
	*			- id - the same id specified by the request
	*			- name - the topic or event name
	*			- interest - the interest tag that categorizes this huddle/event
	*			- description - if applicable, additional details about this event
	*			- location - where this event will be held
	*			- twitter_enabled - true/false whether this event has a twitter feed
	*/

	$_POST = json_decode(file_get_contents("php://input"), true);

	//Make sure user is an authenticated user.
	// $send_response_on_success = false;
	// require './check_credentials.php';

	if(!isset($_POST['event_id'])) {
		header('HTTP/1.1 400 Bad request.', true, 400);
		echo json_encode($message['body'] = 'Event id not specified.');
		exit();
	}

	if(!is_numeric($_POST['event_id'])) {
		header('HTTP/1.1 400 Bad request.', true, 400);
		echo json_encode($message['body'] = 'Event id not specified.');
		exit();
	}

	include_once "../storage_info.php";

	$conn = mysqli_connect(HOST, USER, PASS, NAME);

	$huddles = array();

	if(!mysqli_connect_error()) {
		$query = sprintf("SELECT * FROM Huddle WHERE id=%s",
			mysqli_real_escape_string($conn, $_POST['event_id']));
		$results = mysqli_query($conn, $query);
		if($results) {
			while($result = mysqli_fetch_assoc($results)) {
				array_push($huddles, $result);
			}
		} else {
			header("HTTP/1.1 500 Connection to db failed.", true, 500);
			$data = array();
			$data['message'] = "Connection to db failed.";
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
	echo json_encode($huddles);
	exit();
?>