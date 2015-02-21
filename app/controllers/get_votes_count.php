<?php

// ini_set('display_errors',1);
// ini_set('display_startup_errors',1);
// error_reporting(-1);

	/**
	* This controller returns the same information as get_votes.php along with
	* the current ranking of each option.  Instead of trying to glue each of the
	* necessary tables together to obtain this information, I will use two separate
	* queries to the db and glue the data together from there.
	*
	* @param user_id - Current user's id
	* @param email - Current user's email
	* @param username - Current user's username
	*
	* @return an array of objects with the following fields
	*	- name - name of the vote
	*	- id - id of the vote
	*	- start_time - time the vote is to begin in milliseconds from the epoch
	*	- duration - time in milliseconds the vote is supposed to be open from `start_time`
	*	- question - the subject/question for the vote
	*	- answers - an array of objects with the following form
	*		- option - the alphabetical value of the answer
	*		- value - the value of this option (such as a person's name)
	*		- count - the count of total votes for this option
	*/

	$_POST = json_decode(file_get_contents("php://input"), true);

	//Make sure user is an authenticated user.
	$send_response_on_success = false;
	require './check_credentials.php';

	include_once "../storage_info.php";

	$conn = mysqli_connect(HOST, USER, PASS, NAME);

	$votes = array();

	if(!mysqli_connect_error()) {
		$query = 	"SELECT id, start_time, duration, name, question, GROUP_CONCAT(CONCAT_WS('|', `option`, value) SEPARATOR '|') AS answers FROM Vote LEFT JOIN Answer ON id=vote_id GROUP BY id ORDER BY id";

		$votes_result = mysqli_query($conn, $query);
		if($votes_result) {
			$query = "SELECT vote_id, choice, COUNT(user_id) AS vote_count FROM Ballot GROUP BY vote_id, choice ORDER BY vote_id";
			if($count_result = mysqli_query($conn, $query)) {
				$count_index = 0;
				$count = mysqli_fetch_assoc($count_result);
				while($result = mysqli_fetch_assoc($votes_result)) {
					$vote = $result;
					$vote['answers'] = array();

					$temp = explode('|', $result['answers']);
					$length = count($temp);
					for($i=0; $i<$length; $i=$i+2) {
						$answer = array();
						$answer['option'] = $temp[$i];
						$answer['value'] = $temp[$i+1];

						if($count) {
							if($count['vote_id'] === $vote['id']) {
								$count_choice_ascii = ord($count['choice']);
								$ans_option_ascii = ord($answer['option']);
								
								if($count_choice_ascii === $ans_option_ascii) {
									$answer['count'] = $count['vote_count'];
									$count = mysqli_fetch_assoc($count_result);	
								} else if($count_choice_ascii < $ans_option_ascii) {
									do {
										$count = mysqli_fetch_assoc($count_result);
										$count_choice_ascii = ord($count['choice']);
										$ans_option_ascii = ord($answer['option']);
									} while ($count_choice_ascii < $ans_option_ascii);

									if($count_choice_ascii === $ans_option_ascii) {
										$answer['count'] = $count['vote_count'];
										$count = mysqli_fetch_assoc($count_result);	
									}
								} else {
									$answer['count'] = 0;
								}
							} else if($count['vote_id'] < $vote['id']) {
								do {
									$count = mysqli_fetch_assoc($count_result);
								} while($count && $count['vote_id'] < $vote['id']);	//While the current vote of $count is less than the current vote of $vote, get the next row if that row exists.

								if($count['vote_id'] === $vote['id']) {
									$count_choice_ascii = ord($count['choice']);
									$ans_option_ascii = ord($answer['option']);
									
									if($count_choice_ascii === $ans_option_ascii) {
										$answer['count'] = $count['vote_count'];
										$count = mysqli_fetch_assoc($count_result);	
									} else if($count_choice_ascii < $ans_option_ascii) {
										do {
											$count = mysqli_fetch_assoc($count_result);
											$count_choice_ascii = ord($count['choice']);
											$ans_option_ascii = ord($answer['option']);
										} while ($count_choice_ascii < $ans_option_ascii);

										if($count_choice_ascii === $ans_option_ascii) {
											$answer['count'] = $count['vote_count'];
											$count = mysqli_fetch_assoc($count_result);	
										}
									} else {
										$answer['count'] = 0;
									}
								} else {
									$answer['count'] = 0;
								}
							} else {
								$answer['count'] = 0;
							}
						} else {
							$answer['count'] = 0;
						}

						array_push($vote['answers'], $answer);
					}

					array_push($votes, $vote);
				}
			} else {
				header('HTTP/1.1 500 Connection to db failed.', true, 500);
				exit();
			}
		} else if($votes_result === false) {
			header("HTTP/1.1 500 Connection to db failed.", true, 500);
			$data = array();
			$data['message'] = "Connection to db failed.";
			echo json_encode($data);
			exit();
		} else {
			header("HTTP/1.1 400 No results found.", true, 400);
			$data = array();
			$data['message'] = "No votes have been created yet.";
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