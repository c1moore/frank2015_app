<?php

// ini_set('display_errors',1);
// ini_set('display_startup_errors',1);
// error_reporting(-1);

	/**
	* This controller will find all attendees registered for frank 2015 by first search through the
	* database for all attendees with an account.  After obtaining all users from the database, the
	* CSV file downloaded from Eventbrite will be used to fill in any missing attendees that do not 
	* have an account.  The `csv_index` field in the data will be used to determine whether the row
	* of the CSV file can be skipped since the CSV file should not change once this app is in use.
	* If the attendee does not have an account (i.e. their information has to be pulled from the CSV
	* file), the default value for the `picPath` and `interests` field will be used.
	*
	* @param default_path - the path to be used for an attendee's profile pic if they have not signed
	* 	up to use the app
	* @param default_interests - an array of interests to be used if an attendee has not signed up to
	* 	use the app
	*
	* @return an array of objects with the following fields:
	* 	name - attendee's name
	* 	email - attendee's email
	*	twitter - attendee's twitter handle
	* 	image - path to attendee's profile pic
	* 	interests - an array of the attendee's interests
	*/

	$_POST = json_decode(file_get_contents("php://input"), true);

	//Make sure user is an authenticated user.
	/*$send_response_on_success = false;
	require './check_credentials.php';*/

	include_once "../storage_info.php";

	$conn = mysqli_connect(HOST, USER, PASS, NAME);

	$attendees = array();

	if(!mysqli_connect_error()) {
		if($results = mysqli_query($conn, "SELECT * FROM USER")) {
			while($result = mysqli_fetch_assoc($results)) {
				$index = $result["csv_index"];

				$attendee = array();
				$attendee['name'] = $result['fName'] . " " . $result['lName'];
				$attendee['email'] = $result['email'];
				$attendee['twitter'] = $result['twitter_handle'];
				$attendee['image'] = $result['pic_path'];
				$attendee['interests'] = $result['interests'];

				$attendees[$index] = $attendee;
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

	//After searching database, get all remaining attendees from CSV file.
	if($fhandle = fopen("../resources/wmG73jP5M9R9JxqGxmYo.csv", "r")) {
		$header = fgetcsv($fhandle, 1000);
		$fName_index = -1;
		$lName_index = -1;
		$email_index = -1;
		$twitter_index = -1;

		foreach ($header as $key => $value) {
			if(strcasecmp($value, "Email") === 0) {
				$email_index = $key;
			} else if(strcasecmp($value, "First Name") === 0) {
				$fName_index = $key;
			} else if(strcasecmp($value, "Last Name") === 0) {
				$lName_index = $key;
			} else if(strcasecmp($value, "What is your Twitter handle?") === 0) {
				$twitter_index = $key;
			}
		}

		if($email_index === -1 || $fName_index === -1 || $lName_index === -1 || $twitter_index === -1) {
			header("HTTP/1.1 500 Indices not found.", true, 500);
			$data = array();
			$data['message'] = "Indices not found.";
			echo json_encode($data);
			exit();
		}

		for($i = 0; $result = fgetcsv($fhandle, 1000); $i++) {
			//Since isset is faster than array_key_exists and we should not have to worry about `null`, we can use isset here.
			if(isset($attendees[$i])) {
				continue;
			}

			$attendee = array();
			$attendee['name'] = $result[$fName_index] . " " . $result[$lName_index];
			$attendee['email'] = $result[$email_index];
			$attendee['twitter'] = $result[$twitter_index];
			$attendee['image'] = $_POST['default_path'];
			$attendee['interests'] = $_POST['default_interests'];

			$attendees[$i] = $attendee;
		}
	} else {
		header("HTTP/1.1 500 Could not open file.", true, 500);
		$data = array();
		$data['message'] = "Could not open file.";
		echo json_encode($data);
		exit();
	}

	header("HTTP/1.1 200 OK", true, 200);
	echo json_encode($attendees);
	exit();
?>