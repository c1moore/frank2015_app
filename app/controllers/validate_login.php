<?php
	/**
	* This controller checks the credentials of a user trying to signin against the credentials in
	* our database.  If the credentials are accurate (they exist and the password matches), a status
	* of 200 is sent back to the frontend along with all information required by the frontend to set
	* the user in the localstorage; on the other hand, if the credentials are not accurate a 400 
	* error is sent back.  If any errors occur connecting with the database, an error of 500 is
	* returned.
	*
	* To determine if an email or username was sent, we will determine if $_POST['username'] contains
	* an '@', if it does we can safely assume it is an email, otherwise it was a username.  We use
	* strpos() to determine whether or not this field contains the '@'.  Event though this function
	* could return 0 if an '@' was the first character, this is not a valid email address and it will
	* be assumed that the string was a username.
	*
	* Since timing attacks may be a concern, instead of immediately returning once we have determined
	* the password is incorrect we will wait a random amount of time then return an error.
	*
	* @param username - the username submitted by the user
	* @param password - the plain text password submitted by the user
	*
	* @return user_id - if the credentials are accurate, the unique user_id is returned
	* @return email - if the creadentials are accurate, the email address used to signup is returned
	*/

	include_once "../storage_info.php";

	$conn = mysqli_connect(HOST, USER, PASS, NAME);

	if(!mysqli_connect_error()) {
		if(strpos($_POST['username'], '@')) {
			$stmt = mysqli_prepare($conn, "SELECT username, email, user_id, password FROM User WHERE email=?");
		} else {
			$stmt = mysqli_prepare($conn, "SELECT username, email, user_id, password FROM User WHERE username=?");
		}
			
		if($stmt) {
			mysqli_stmt_bind_param($stmt, "s", $_POST['username']);

			if(mysqli_stmt_execute($stmt)) {
				mysqli_stmt_bind_result($stmt, $rusername, $remail, $ruser_id, $rpassword);

				if(mysqli_stmt_fetch($stmt)) {
					if($rpassword && crypt($_POST['password'], $rpassword)) {
						header('Content-Type: application/json');
						header('HTTP/1.1 200 Success', true, 200);

						$data = array();
						$data['body'] = array('username' => $rusername, 'email' => $remail, 'user_id' => $ruser_id);

						echo json_encode($data);
					} else {
						//If this is a timing attack, make them wait a random amount of time before telling them the password was wrong.
						$sleep = bindec(openssl_random_pseudo_bytes(3));
						if($sleep > 2)
							$sleep = $sleep*.15;
						usleep($sleep);

						header('HTTP/1.1 401 Username/email not found or password does not match.', true, 401);
						exit();
					}
				} else {
					//If this is a timing attack, make them wait a random amount of time before telling them the password was wrong.
					$sleep = bindec(openssl_random_pseudo_bytes(3));
					if($sleep > 2)
						$sleep = $sleep*.15;
					usleep($sleep);

					header('HTTP/1.1 401 Username/email not found or password does not match.', true, 401);
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
	} else {
		header('HTTP/1.1 500 Could not connect to database.', true, 500);
		exit();
	}
?>