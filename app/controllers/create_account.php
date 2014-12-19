<?php
	/**
	* This controller handles creating a user account.  Since it is required for a user to have
	* signed up on Eventbrite to attend the event, a file containing all Eventbrite registrants
	* will be searched to determine if the email used to create the account belongs to a
	* registrant.  If th email does not exist in the file or if the email is already in use,
	* the account will be rejected.  If the latter reason is the case, an error message should
	* be displayed to the user urging them to notify Ann or me immediately.
	*
	* I have decided to use a file on the server in place of getting up-to-date information
	* from the Eventbrite server for the following reasons.
	*    -Speed - since the currently installed version of PHP does not appear to support multi-
	*        threading, waiting for Eventbrite to return ALL attendees and then searching the
	*        results for a specific user could take an unreasonable amount of time
	*    -Most, if not all, attendees to frank2015 will have signed up to attend weeks before
	*        frank2015 will be held.  For this reason, up-to-date information is not necessary.
	* The main reason against using this method is security.  If somebody were able to find this
	* file, they could use the information to create an account.  However, since there is a
	* relatively small number of users (a community of users), these threats should be easily
	* detectable and fixable.
	*
	* TODO: Add a security measure to email users before activating their account.
	*
	* @param fName - user's first name
	* @param lName - user's last name
	* @param username (optional) - user's prefferred username if specified
	* @param email - user's email used when signing up to attend event in Eventbrite
	* @param pic (optional) - user's picture if specified
	* @param interests (optional) - user's interests if specified
	*
	* @return username - username if specified by user or empty string
	* @return email - user's email
	* @return user_id - newly created user_id
	*/

	$_POST = json_decode(file_get_contents("php://input"), true);

	function create_user($conn, $order_num) {
		//Since exif_imagetype passed, we will assume the extension is correct.
		if(isset($_FILES['file'])) {
			$picPath = "../../public/img/profile_pics/" . $order_num . pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
			move_uploaded_file($_FILES['tmp_name'], $picPath);
		} else {
			$picPath = "../../public/img/profile_pics/default.jpg";
		}

		if($stmt = mysqli_prepare($conn, "INSERT INTO User(fName, lName, email, user_id, username, pic_path, interests) VALUES (?, ?, ?, ?, NULLIF(?, ''), ?, NULLIF(?, ''))")) {
			mysqli_stmt_bind_param($stmt, "sssisss", $_POST['fName'], $_POST['lName'], $_POST['email'], $order_num, $_POST['username'], $picPath, $_POST['interests']);

			if(mysqli_stmt_execute($stmt)) {
				header('HTTP/1.1 200 Account created.', true, 200);

				$data = array();
				$data['user_id'] = $order_num;
				$data['email'] = $_POST['email'];
				$data['username'] = $_POST['username'];

				echo json_encode($data);

				exit();
			} else {
				$data = array();

				if(mysqli_stmt_errno($stmt) === 1062) {
					header('HTTP/1.1 400 Error creating account.', true, 400);
					$data['message'] = "It looks like this account is already in use.  If you already have an account, login <a target="_self" href='login.html'>here</a>.  If you do not have an account, please contact Ann (<a target="_self" href='mailto:achristiano@jou.ufl.edu'>achristiano@jou.ufl.edu</a>) or Calvin (<a target="_self" href='mailto:c1moore@ufl.edu'>c1moore@ufl.edu</a>) immediately.";
				} else {
					header('HTTP/1.1 500 Error creating account. Please try again later.', true, 500);
					$data['message'] = mysqli_stmt_errno($stmt) . "There was an error connecting to our servers to create your account.  Please try again later.";
				}

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
	}

	include_once "../storage_info.php";

	$conn = mysqli_connect(HOST, USER, PASS, NAME);

	if(!mysqli_connect_error()) {
		/**
		* Check all fields to make sure they are specified, if necessary, and have
		* the proper properties.
		*/

		//Make sure all required fields are specified, if not return 400 status.
		if(!strlen($_POST['fName']) || !strlen($_POST['lName']) || !strlen($_POST['email'])) {
			header('HTTP/1.1 400 Required field not specified.', true, 400);
			$data = array();
			$data['message'] = "A required field is missing.";
			echo json_encode($data);
			exit();
		}

		if(isset($_FILES['file']) && !exif_imagetype($_FILES['file']['tmp_name'])) {
			header('HTTP/1.1 400 Image type not accepted.', true, 400);
			$data = array();
			$data['message'] = "File type not recognized or file is not an image.";
			echo json_encode($data);
			exit();
		}

		//If a username was specified, make sure it meets the requirements.  Also make sure it is not already being used.
		if(isset($_POST['username']) && (!(strlen($_POST['username']) > 5 && strlen($_POST['username'] < 25)) || !ctype_alnum($_POST['username']))) {
			header('HTTP/1.1 400 Username can only be alphanumeric characters.', true, 400);
			$data = array();
			$data['message'] = "Username can only contain letters and numbers.";
			echo json_encode($data);
			exit();
		} else if(isset($_POST['username'])) {
			if($stmt = mysqli_prepare($conn, "SELECT username FROM User WHERE username=?")) {
				mysqli_stmt_bind_param($stmt, "s", $_POST['username']);

				if(mysqli_stmt_execute($stmt)) {
					mysqli_stmt_bind_result($stmt, $rusername);

					$result = mysqli_stmt_fetch($stmt);
					if(!is_null($result)) {
						//Username is already in use.
						header("HTTP/1.1 400 Username already exists.", true, 400);
						$data = array();
						$data['message'] = "Username already exists.";
						echo json_encode($data);
						exit();
					} else if(!$result) {
						//An error occurred.
						header("HTTP/1.1 500 An error occurred. Please try again later.", true, 500);
						$data = array();
						$data['message'] = "An error occurred.  Please try again later.";
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
				header('HTTP/1.1 500 Prepared statement failed.', true, 500);
				$data = array();
				$data['message'] = "Prepared statement failed.";
				echo json_encode($data);
				exit();
			}
		} else if(!isset($_POST['username'])) {
			$_POST['username'] = '';
		}

		if(!isset($_POST['interests'])) {
			$_POST['interests'] = '';
		} else {
			$_POST['interests'] = implode(",", $_POST['interests']);
		}

		/**
		* Make sure this user is registered to attend the event.
		*/
		if($fhandle = fopen("../resources/wmG73jP5M9R9JxqGxmYo.csv", "r")) {
			$header = fgetcsv($fhandle);
			$email_index = -1;
			$order_index = -1;
			foreach ($header as $key => $value) {
				if(strcasecmp($value, "Email") === 0) {
					$email_index = $key;
				}
				if(strcasecmp($value, "Order #") === 0) {
					$order_index = $key;
				}

				if($email_index > -1 && $order_index > -1)
					break;
			}

			if($email_index === -1 || $order_index === -1) {
				header('HTTP/1.1 500 Index not found.', true, 500);
				$data = array();
				$data['message'] = "Index not found.";
				echo json_encode($data);
				exit();
			}

			while($attendee = fgetcsv($fhandle)) {
				if(strcasecmp($attendee[$email_index], $_POST['email']) === 0) {
					$order_num = $attendee[$order_index];
					fclose();

					create_user($conn, $order_num);

					break;
				}
			}

			header('HTTP/1.1 400 Email not found.', true, 400);
			$data = array();
			$data['message'] = "Email not found.";
			echo json_encode($data);
			exit();
		} else {
			header('HTTP/1.1 500 File not found.', true, 500);
			$data = array();
			$data['message'] = "File not found.";
			echo json_encode($data);
			exit();
		}
	} else {
		header('HTTP/1.1 500 Could not connect to server.', true, 500);
			$data = array();
			$data['message'] = "Could not connect to server.";
			echo json_encode($data);
		exit();
	}
?>