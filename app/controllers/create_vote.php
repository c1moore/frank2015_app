<?php

// ini_set('display_errors',1);
// ini_set('display_startup_errors',1);
// error_reporting(-1);

	/**
	* This controller creates a new vote if the user requesting this is an admin.
	*
	* @param user_id - Current user's id
	* @param email - Current user's email
	* @param username - Current user's username
	* @param question - New vote's question
	* @param name - New vote's name
	* @param start_time - Start time for new vote in milliseconds from epoch
	* @param duration - Duration of new vote in milliseconds
	* @param options - New vote's options, which should contain the following fields:
	*	- option - the letter choice for this answer
	*	- value - the value of this answer (i.e. a candidate's name)
	*/

	$_POST = json_decode(file_get_contents("php://input"), true);
	$_POST['check_admin'] = true;

	//Make sure user is an authenticated user.
	/*$send_response_on_success = false;
	require './check_credentials.php';*/

	include_once "../storage_info.php";

	$conn = mysqli_connect(HOST, USER, PASS, NAME);

	$votes = array();
	$votes['answers'] = array();

	if(!mysqli_connect_error()) {
		if($stmt = mysqli_prepare($conn, "INSERT INTO Vote(name, question, start_time, duration) VALUES ('?', '?', ?, ?)")) {
			mysqli_stmt_bind_param($stmt, "ssii", $_POST['name'], $_POST['question'], $_POST['start_time'], $_POST['duration']);

			if(mysqli_stmt_execute($stmt)) {
				$vote_id = mysqli_insert_id($conn);

				if($stmt = mysqli_prepare($conn, "INSERT INTO Answer(vote_id, option, value) VALUES (?, ?, ?)")) {
					$length =count($_POST['options']);
					for($i=0; $i<$length; $i++) {
						mysqli_stmt_bind_param($stmt, "iss", $vote_id, $_POST['options'][$i].option, $_POST['options'][$i].value);

						if(!mysqli_stmt_execute($stmt)) {
							header('HTTP/1.1 500 Prepared statement failed.', true, 500);
							$data = array();
							$data['message'] = "Prepared statement 2 failed.";
							echo json_encode($data);
							exit();
						}
					}
				}
			} else {
				header('HTTP/1.1 500 Error creating account. Please try again later.', true, 500);
				$data = array();
				$data['message'] = mysqli_stmt_errno($stmt);
				echo json_encode($data);
				exit();
			}
		} else {
			header('HTTP/1.1 500 Prepared statement failed.', true, 500);
			$data = array();
			$data['message'] = "Prepared statement failed.";
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