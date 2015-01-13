<?php
	echo microtime() . "<br />";
	echo microtime(true) . "<br />";
	echo time() . "<br />";

	echo 'exit_imagetype: ' . function_exists('exif_imagetype');
	echo 'substr: ' . function_exists('substr');
	echo 'bin2hex: ' . function_exists('bin2hex');
	echo 'oppenssl_random_psuedo_bytes: ' . function_exists('openssl_random_pseudo_bytes');
	echo 'crypt: ' . function_exists('crypt');

	phpinfo();
?>