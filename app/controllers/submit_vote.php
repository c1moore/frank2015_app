<?php

ini_set('display_errors',1);
ini_set('display_startup_errors',1);
error_reporting(-1);

	/**
	* This controller will save a user's vote in the database given the following
	* conditions are met:
	*	- The user is logged in and their credentials all match (this will be
	*		determined using check_credentials.php).
	*	- The timestamp sent with the request is within the vote's allotted time
	*		limit (i.e. start_time<=timestamp<=(start_time+duration)).
	*	- The request was sent less than two seconds ago (i.e. 0<=(
	*		current_time-time_stamp)<=2).
	*	- The user has not voted yet, so changing one's mind is not permitted.
	*	- The `choice` is a valid alphabetical option for this vote.
	*
	* @param user_id - Current user's id
	* @param email - Current user's email
	* @param username - Current user's username
	* @param vote_id - vote's id number
	* @param choice - the alphabetical choice of the voter as stored in the db
	* @param submission_time - the time at which the vote was submitted
	*
	* @return message - if an error occurred with error code other than 500, this
	*	will contain the error message.
	*/

	$current_time = microtime(true);	//Get the current time to be used to validate submission.

	$_POST = json_decode(file_get_contents("php://input"), true);

	//Make sure user is an authenticated user.
	/*$send_response_on_success = false;
	require './check_credentials.php';*/

	/**
	* Obtain the vote from the database to make sure the ballot was submitted while
	* voting was allowed and `choice` is a valid option.
	*/
	include_once "../storage_info.php";
	$conn = mysqli_connect(HOST, USER, PASS, NAME);

	if(!mysqli_connect_error()) {
		if($stmt = mysqli_prepare($conn, "SELECT start_time, duration FROM Vote LEFT JOIN Answer ON id=vote_id WHERE vote_id = ? AND option =  ? LIMIT 1")) {
			mysqli_stmt_bind_param($stmt, "ss", $_POST['vote_id'], $_POST['choice']);

			if(mysqli_stmt_execute($stmt)) {
				mysqli_stmt_bind_result($stmt, $rstart_time, $rduration);

				$result = mysqli_stmt_fetch($stmt);
				if($result === true) {
					$submit_time_millis = $_POST['submission_time'] * 0.001;
					$elapsed_time = $current_time - $submit_time_millis;
					if(!($rstart_time <= $submit_time_millis && $submit_time_millis <= ($rstart_time + $rduration))) {
						header('HTTP/1.1 400 Voting has closed.', true, 400);
						$data = array();
						$data['message'] = "Sorry, the polls already closed for this vote.";
						echo json_encode($data);
						exit();
					} else if(0 <= $elapsed_time && $elapsed_time <= 2) {
						header('HTTP/1.1 400 Cheating detected.', true, 400);
						$data = array();
						$data['message'] = "Looks like our servers took too long (we have to be careful against cheaters).  Please try again.";
						echo json_encode($data);
						exit();
					}
				} else if($result === NULL) {
					//This should only run if the vote does not exist or if the choice passed was not an actual option for this vote.
					header('HTTP/1.1 400 Option not valid or vote does not exist.', true, 400);
					$data = array();
					$data['message'] = "Looks like there was a mistake.  Please refresh the page and try again.";
					echo json_encode($data);
					exit();
				} else {
					header('HTTP/1.1 500 Prepared statement failed.', true, 500);
					exit();
				}
			}
		}

		//Everything checks out, add the vote to the database.
		if($stmt = mysqli_prepare($conn, "INSERT INTO Ballot(vote_id, user_id, choice) VALUES (?, ?, '?')")) {
			mysqli_stmt_bind_param($stmt, "iis", $_POST['vote_id'], $_POST['user_id'], $_POST['choice']);

			if(mysqli_stmt_execute($stmt)) {
				//Ballot created successfully.
				header("HTTP/1.1 200 OK", true, 200);
				exit();
			} else {
				if(mysqli_stmt_errno($stmt) === 1062) {
					//Ballot already existed.
					header('HTTP/1.1 400 Ballot already exists.', true, 400);
					$data = array();
					$data['message'] = "It seems you have already voted.  If this is a mistake, please cotact Ann and we will take care of this.";
					echo json_encode($data);
					exit();
				} else {
					//Another error occurred.
					header('HTTP/1.1 500 Error saving ballot.', true, 500);
					exit();
				}
			}
		}
	} else {
		header("HTTP/1.1 500 Failed to connect to database.", true, 500);
		$data = array();
		$data['message'] = "Failed to connect to database.";
		echo json_encode($data);
		exit();
	}
?>