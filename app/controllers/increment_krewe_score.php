<?php

// ini_set('display_errors',1);
// ini_set('display_startup_errors',1);
// error_reporting(-1);

	/**
	* This controller simply increments a krewe's score by 1 point based on the
	* Krewe's id.
	*
	* @param user_id - Current user's id
	* @param email - Current user's email
	* @param username - Current user's username
	* @param krewe_id - Krewe's ID for which the score should be incremented
	*/

	$_POST = json_decode(file_get_contents("php://input"), true);
	$_POST['check_admin'] = true;

	//Make sure user is an authenticated user.
	$send_response_on_success = false;
	require './check_credentials.php';

	include_once "../storage_info.php";

	$conn = mysqli_connect(HOST, USER, PASS, NAME);

	if(!mysqli_connect_error()) {
		if($stmt = mysqli_prepare($conn, "SELECT score FROM Krewe WHERE id = ?")) {
			mysqli_stmt_bind_param($stmt, "i", $_POST['krewe_id']);

			if(mysqli_stmt_execute($stmt)) {
				mysqli_stmt_bind_result($stmt, $rscore);

				if(mysqli_stmt_fetch($stmt)) {
					mysqli_stmt_close($stmt);

					if($stmt = mysqli_prepare($conn, "UPDATE Krewe SET score = ? WHERE id = ?")) {
						$rscore++;
						mysqli_stmt_bind_param($stmt, "ii", $rscore, $_POST['krewe_id']);

						mysqli_stmt_execute($stmt);
					} else {
						header("HTTP/1.1 500 Failed to connect to database.", true, 500);
						$data = array();
						$data['message'] = "Failed to connect to database 4.";
						echo json_encode($data);
						exit();
					}
				} else {
					header("HTTP/1.1 500 Failed to connect to database.", true, 500);
					$data = array();
					$data['message'] = "Failed to connect to database 3.";
					echo json_encode($data);
					exit();
				}
			} else {
				header("HTTP/1.1 500 Failed to connect to database.", true, 500);
				$data = array();
				$data['message'] = "Failed to connect to database 2.";
				echo json_encode($data);
				exit();
			}
		} else {
			header("HTTP/1.1 500 Preparing failed.", true, 500);
			$data = array();
			$data['message'] = "Preparing failed.";
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
	exit();
?>