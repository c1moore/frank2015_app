<?php

// ini_set('display_errors',1);
// ini_set('display_startup_errors',1);
// error_reporting(-1);

	/**
	* This controller returns all team members and the groups to which the belong.
	* This is done by joining the krewe and krewe_member tables.
	*
	* @return an array of objects with the following fields:
	*	member_fname - member first name
	*	member_lname - member last name
	*	team_name - team name
	*	krewe_captain - the krewe captain for this team
	*	score - team's score
	*/

	$_POST = json_decode(file_get_contents("php://input"), true);

	//Make sure user is an authenticated user.
	$send_response_on_success = false;
	require './check_credentials.php';

	include_once "../storage_info.php";

	$conn = mysqli_connect(HOST, USER, PASS, NAME);

	$members = array();

	if(!mysqli_connect_error()) {
		//Since the user_id has been validated at this point, we can simply escape the string.
		$query = sprintf("SELECT team_name, score, krewe_captain, member_fname, member_lname FROM Krewe JOIN Krewe_Member ON Krewe.id = Krewe_Member.krewe_id");
		$results = mysqli_query($conn, $query);
		if($results) {
			while($result = mysqli_fetch_assoc($results)) {
				array_push($members, $result);
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
	echo json_encode($members);
	exit();
?>