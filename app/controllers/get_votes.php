<?php

// ini_set('display_errors',1);
// ini_set('display_startup_errors',1);
// error_reporting(-1);

	/**
	* This controller returns all the votes in the database if the user requesting
	* this data is a valid user.
	*
	* @param user_id - Current user's id
	* @param email - Current user's email
	* @param username - Current user's username
	*
	* @return votes - an array of objects with the following fields
	*	name - name of the vote
	*	id - id of the vote
	*	start_time - time the vote is to begin in milliseconds from the epoch
	*	duration - time in milliseconds the vote is supposed to be open from `start_time`
	*	question - the subject/question for the vote
	*	answers - an array of objects with the following form
	*		option - the alphabetical value of the answer
	*		value - the value of this option (such as a person's name)
	*/

	$_POST = json_decode(file_get_contents("php://input"), true);

	//Make sure user is an authenticated user.
	/*$send_response_on_success = false;
	require './check_credentials.php';*/

	include_once "../storage_info.php";

	$conn = mysqli_connect(HOST, USER, PASS, NAME);

	$votes = array();
	$votes['answers'] = array();

	if(!mysqli_connect_error()) {
		$query = 	"SELECT id, start_time, duration, name, question, GROUP_CONCAT(" .
						"CONCAT_WS(" .
							"'|', option, value)" .
						"SEPARATOR '|') AS answers" .
					"FROM Vote LEFT JOIN Answer ON id=vote_id" .
					"GROUP BY id";
		if($results = mysqli_query($conn, $query)) {
			while($result = mysqli_fetch_assoc($results)) {
				$vote = array();
				$vote['name'] = $result['name'];
				$vote['id'] = $result['id'];
				$vote['start_time'] = $result['start_time'];
				$vote['duration'] = $result['duration'];
				$vote['question'] = $result['question'];
				$vote['answers'] = array();

				$temp = $result['answers'];
				$length = count($temp);
				for($i=0; $i<$length; $i=$i+2) {
					$answer = array();
					$answer['option'] = $temp[$i];
					$answer['value'] = $temp[$i+1];

					array_push($vote['answers'], $answer);
				}

				array_push($votes, $vote);
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
	echo json_encode($votes);
	exit();
?>