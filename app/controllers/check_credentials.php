<?php
	/**
	* This route attempts to check the credentials set in the localstorage against the ones set in
	* our database.  If these credentials do not match, a 401 error is returned detailing wether
	* the credentials could not be found in the database or if the credentials in localstorage do
	* not match those in the database.  If an error occurs, a 500 error is returned.
	*
	* @param user_id - the value of user_id stored in localstorage
	* @param username - the value of username stored in localstorage
	* @param email - the value of email stored in localstorage
	* @param check_admin - if specified and true, 200 will be returned only if the user is an admin
	*/

	//If user_id is not set, $_POST may not be set so we need to set it.  Otherwise, no need to reset $_POST.
	if(!$_POST['user_id']) {
		$_POST = json_decode(file_get_contents("php://input"), true);
	}

	include_once "../storage_info.php";

	if(!isset($send_response_on_success)) {
		$send_response_on_success = true;
	}

	if(!isset($_POST['check_admin'])) {
		$_POST['check_admin'] = false;
	}

	if(!isset($_POST['user_id']) || !isset($_POST['email'])) {
		header('HTTP/1.1 400 Credentials not set.', true, 400);
		$data = array();
		$data['message'] = "Credentials not set.";
		echo json_encode($data);
		exit();
	}

	$conn = mysqli_connect(HOST, USER, PASS, NAME);
	//Connect to the database, if there is an error return 500.
	if(mysqli_connect_error()) {
		header('HTTP/1.1 500 Could not connect to databse.', true, 500);
		exit();
	} else {
		//Prepare statement to search database based on user_id, if error return 500.
		if($stmt = mysqli_prepare($conn, "SELECT username, email, role FROM User WHERE user_id=?")) {
			mysqli_stmt_bind_param($stmt, "s", $_POST['user_id']);
			if(mysqli_stmt_execute($stmt)) {
				mysqli_stmt_bind_result($stmt, $rusername, $remail, $rrole);

				//Check that the credentials match, return 401 if user not found or credentials don't match, 200 otherwise.
				if(mysqli_stmt_fetch($stmt)) {
					if($rusername == $_POST['username'] && $remail == $_POST['email']) {
						if($_POST['check_admin']) {
							if($rrole === "admin") {
								if($send_response_on_success) {
									header('HTTP/1.1 200 Success', true, 200);
									exit();
								}
							} else {
								header('HTTP/1.1 401 Not authorized.', true, 401);
								$data = array();
								$data['message'] = "Not authorized.";
								echo json_encode($data);
								exit();
							}
						} else {
							if($send_response_on_success) {
								header('HTTP/1.1 200 Success', true, 200);
								exit();
							}
						}
					} else {
						header('HTTP/1.1 401 Credentials do not match.', true, 401);
					}
				} else {
					header('HTTP/1.1 401 User not found.', true, 401);
					exit();
				}
			} else {
				header('HTTP/1.1 500 Prepared statement failed.', true, 500);
				exit();	
			}
		} else {
			header('HTTP/1.1 500 Prepared statement failed.', true, 500);
			exit();
		}
	}
?>