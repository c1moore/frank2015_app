<?php

// ini_set('display_errors',1);
// ini_set('display_startup_errors',1);
// error_reporting(-1);

	/**
	* This controller returns all information about a krewe, including its team
	* members.  Each krewe is grouped together based on krewe id; member names
	* are only separated by a comma.
	*
	* @return an array of objects with the following fields:
	*	members - a comma separated list of names
	*	team_name - team name
	*	krewe_captain - the krewe captain for this team
	*	score - team's score
	*	id - krewe id
	*/

	$_POST = json_decode(file_get_contents("php://input"), true);
	$_POST['check_admin'] = true;

	//Make sure user is an authenticated user.
	$send_response_on_success = false;
	require './check_credentials.php';

	include_once "../storage_info.php";

	$conn = mysqli_connect(HOST, USER, PASS, NAME);

	$krewes = array();

	if(!mysqli_connect_error()) {
		//Since the user_id has been validated at this point, we can simply escape the string.
		$query = sprintf("SELECT team_name, score, krewe_captain, id, GROUP_CONCAT(CONCAT_WS(' ', Krewe_Member.member_fname, Krewe_Member.member_lname) SEPARATOR ',') AS members FROM Krewe JOIN Krewe_Member ON Krewe.id = Krewe_Member.krewe_id GROUP BY Krewe.id");
		$results = mysqli_query($conn, $query);
		if($results) {
			while($result = mysqli_fetch_assoc($results)) {
				array_push($krewes, $result);
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
	echo json_encode($krewes);
	exit();
?>