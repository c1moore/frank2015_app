<?php

// ini_set('display_errors',1);
// ini_set('display_startup_errors',1);
// error_reporting(-1);

	/**
	* This controller saves a new krewe and its members in the database if the
	* current user is an admin.  Otherwise, 400 is returned.
	*
	* @param user_id - Current user's id
	* @param email - Current user's email
	* @param username - Current user's username
	* @param team_name - New Krewe's team name
	* @param krewe_captain - New Krewe's captain's name
	* @param members - array of objects that represent each member's name.  The
	*		 object should have the format {member_fname : members_first_name,
	*		 member_lname : members_last_name}
	*/

	$_POST = json_decode(file_get_contents("php://input"), true);
	$_POST['check_admin'] = true;

	//Make sure user is an authenticated user.
	$send_response_on_success = false;
	require './check_credentials.php';

	include_once "../storage_info.php";

	$conn = mysqli_connect(HOST, USER, PASS, NAME);

	if(!mysqli_connect_error()) {
		if($stmt = mysqli_prepare($conn, "INSERT INTO Krewe(krewe_captain, team_name) VALUES (?, ?)")) {
			mysqli_stmt_bind_param($stmt, "ss", $_POST['krewe_captain'], $_POST['team_name']);

			if(mysqli_stmt_execute($stmt)) {
				$krewe_id = mysqli_insert_id($conn);

				mysqli_stmt_close($stmt);

				if($stmt = mysqli_prepare($conn, "INSERT INTO Krewe_Member(krewe_id, member_fname, member_lname) VALUES (?, ?, ?)")) {
					$length = count($_POST['members']);

					for($i = 0; $i < $length; $i++) {
						mysqli_stmt_bind_param($stmt, "iss", $krewe_id, $_POST['members'][$i]['member_fName'], $_POST['members'][$i]['member_lName']);

						if(!mysqli_stmt_execute($stmt) && !headers_sent()) {
							header('HTTP/1.1 404 Error', true, 404);
							$data = array();
							$data['message'] = "Some members were not correctly inserted.  Contact Calvin immediately before something blows up." . mysqli_stmt_error($stmt);
							echo json_encode($data);
						}
					}
				} else {
					header('HTTP/1.1 404 Error', true, 404);
					$data = array();
					$data['message'] = "Krewe has been created, but the members could not be added.  Contact Calvin immediately before something blows up.";
					echo json_encode($data);
					exit();
				}
			} else {
				header('HTTP/1.1 404 Error', true, 404);
				$data = array();
				$data['message'] = "Error creating Krewe.  Try again later.";
				echo json_encode($data);
				exit();
			}
		} else {
			header('HTTP/1.1 404 PError', true, 404);
			$data = array();
			$data['message'] = "Error creating Krewe.  Try again later.";
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

	if(!headers_sent())
		header("HTTP/1.1 200 OK", false, 200);
	exit();
?>