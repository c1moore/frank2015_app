var frankAppSFBook = angular.module('frankAppSFBook', ['angular-carousel', 'ngFitText', 'frank2015', 'ngAnimate', 'pasvaz.bindonce', 'infinite-scroll']);


/**
* TODO: Change filter to ng-hide for performance reasons.
*/

frankAppSFBook.controller('SpeakerController', ['$scope', '$http', 'localStorageService', '$window', 'interestsService', '$timeout', '$sce',
	function($scope, $http, localStorageService, $window, interestsService, $timeout, $sce) {
		$scope.storage = localStorageService;
		$scope.intServArr = interestsService.interests;

		//Check if the user is logged in.  If not, they should be redirected to the login page.
		var user_id = $scope.storage.get('user_id'),
			email = $scope.storage.get('email'),
			username = $scope.storage.get('username');
		if(user_id && email) {
			$http.post('../../app/controllers/check_credentials.php', {user_id : user_id, email : email, username : username}).error(function() {
				$scope.storage.remove('user_id');
				$scope.storage.remove('email');
				$scope.storage.remove('username');

				$window.location.href = 'login.html';
			});
		} else {
			$scope.storage.remove('user_id');
			$scope.storage.remove('email');
			$scope.storage.remove('username');

			$window.location.href = 'login.html';
		}
		$scope.query = {};
		$scope.queryBy = '$';
		$scope.carouselQuery = '';
		$scope.search = false;
		$scope.carouselIndex = 0;
		$scope.carousel = true;
		$scope.tableLimit = 20;
		
		$scope.showing = {name : true, organization : true};
		
		$scope.showColumn = function(column) {
			$scope.showing[column] = true;
		};

		$scope.getTopMargin = function(height) {
			var margin = parseInt(angular.element("#header").css('height'), 10) + height;
			return margin + "px";
		};

		$scope.carouselFilter = function(row) {
			return (row.name.toLowerCase().indexOf($scope.carouselQuery || '') !== -1 || row.organization.toLowerCase().indexOf($scope.carouselQuery || '') !== -1 || $sce.getTrustedHtml(row.bio).toLowerCase().indexOf($scope.carouselQuery || '') !== -1);
		};

		$scope.loadMore = function() {
			$scope.tableLimit += 20;
		};

		$scope.getBioLinkLeftPos = function() {
			return (($window.innerWidth * .5) - 50) + 'px';
		};

		$scope.scrollToBio = function(index) {
			elemId = 'carousel-item-' + index;
			$timeout(function() {
				document.getElementById(elemId).scrollTop = $window.innerHeight * .75;
			},0);
		};

		/**
		* Return the max width for the search bar.  On some screens, the set width is too large and
		* causes it to move to below the link to view the participant table.  To determine the max-width,
		* find the 'View Participant Table' element, determine its width, subtract that from the total
		* width of the screen along with any margins, and return the resulting value.  Unfortunately,
		* this cannot change the problem with the animations.
		*/
		$scope.getSearchMaxWidth = function() {
			var linkelem = angular.element("#carousel-view-switch");
			return $window.innerWidth - linkelem.outerWidth() - 20 - parseInt(angular.element("#carousel-search-box").css('margin-right'), 10);	/*20 is the number of pixels that should remain between the link and the search box.*/
		};
		
		$scope.speakers = [
			{
				name : 'Sara Bleich',
				organization : 'Johns Hopkins Bloomberg School of Public Health',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/bleich.jpg',
				bio : $sce.trustAsHtml('<p>Sara N. Bleich, PhD is an Associate Professor in the Department of Health Policy and Management at the Johns Hopkins Bloomberg School of Public Health. Sara is nationally known for her research on obesity prevention, particularly targeting vulnerable populations at highest risk for excess body weight. Sara\'s research bridges public policy and obesity prevention and control. Her research addresses the factors associated with obesity, physician practice patterns and innovative environmental strategies to reduce excess caloric intake. Sara is the past recipient of an Agency for Healthcare Research and Quality traineeship, a Harvard Graduate Prize Fellowship, a Harvard Graduate School of Arts and Sciences dissertation completion fellowship, an award for "most outstanding abstract" at the International Conference on Obesity in Sydney, Australia, and an award for "best research manuscript" in the journal Obesity. Sara is the recipient of a K01 Career Development Award from National Heart, Lung and Blood Institute at the NIH and multiple Healthy Eating Research grants from the Robert Wood Johnson Foundation, among other competitive funding. Sara holds degrees from Columbia (BA, Psychology) and Harvard (PhD, Health Policy).</p>')
			},
			{
				name : 'Chad Boettcher',
				organization : 'Participant Media',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Chad-Boettcher-headshot-300dpi.jpg',
				bio : $sce.trustAsHtml('<p>Chad Boettcher is Executive Vice President, Social Action and Advocacy at Participant Media, the global entertainment company devoted to feature film, television, publishing and digital content that inspires social change. Boettcher is responsible for leading the creation, development and execution of strategies that leverage Participant\'s content and investments across all its lines of business - film, television and digital - for social impact.</p><p>Under Boettcher\'s leadership, the company has worked with experts and influencers to create dozens of social action campaigns for films like <em>Lincoln, Snitch, Middle of Nowhere, A Place at the Table, Last Call at the Oasis</em> and <em>Cesar Chavez</em>; and for television shows like the Emmy&reg;-winning HIT RECORD ON TV, HUMAN RESOURCES and PLEASE LIKE ME.  His team also leads initiatives across TakePart that activate its communities on important issues of the day, and manage the 100+ NGOs who have joined its Social Action Network that leverages digital content to drive social change.</p><p>Additionally, Boettcher oversees Participant\'s efforts to study and measure the social impact of entertainment content, and working media impact specialists developed The Participant Index (TPI), a unique tool that measures an audience\'s shift in knowledge, attitude and behavior from a story.</p><p>Prior to joining Participant in November 2011, Boettcher taught marketing innovation at NYU and was Senior Vice President of Social Innovation at Weber Shandwick, where he helped lead a team that advised clients on issues in corporate social responsibility, citizenship, sustainability and cause marketing. Previously, he served as Nike\'s Global Director of Corporate Responsibility, where his work included the "Let Me Play" campaign, the "Reuse-A-Shoe" program, and the "Nike Summer Shoes" initiative. Boettcher also worked for MTV as Senior Director of Strategic Partnerships and Public Affairs, developing programs like "Alternative Spring Break," "Choose or Lose," and the channel\'s Emmy&reg;-winning partnership on sexual health and HIV/AIDS.  Additionally, he worked for the presidential campaigns both Al Gore (2000) and Barack Obama (2008).</p><p>Boettcher, a former board member of the Gay Lesbian Alliance Against Defamation (GLAAD), holds a B.A. from Miami University.</p>')
			},
			{
				name : 'Taylor Brandon',
				organization : 'Frank Karel Fellow',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Taylor_Brandon-photo.jpg',
				bio : $sce.trustAsHtml('<p>Taylor Brandon is a senior at DePaul University majoring in public relations and advertising. She carries out DePaul\'s Vincentian mission as a resident advisor and president of the service-based dance team, Nu\'ance. Taylor uses Nu\'ance as a means to connect women of color on DePaul\'s campus. Taylor was hosted by the Food Recovery Network, an organization that unites students on college campuses to fight waste and feed people by donating the surplus unsold food from their colleges and donating it to hungry Americans.</p>')
			},
			{
				name : 'Andy Burness',
				organization : 'Burness Communications',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Andy.png',
				bio : $sce.trustAsHtml('<p>Andy Burness is the founder and president of Burness Communications, a mission-driven global communications firm supporting nonprofits and the people they serve. Founded in 1986, the company has served over 400 non-profit organizations and has been cited four times by Washington-area media as one of the region\'s "great places to work."</p><p>Andy is regularly sought after for counsel on strategies to increase the impact and amplify the voices of those committed to improving quality of life for people who are poor or vulnerable. His work as an advocate for social policy reform has spanned a broad range of domestic issues, from care at the end of life to educational opportunity, biomedical research to adolescent health, urban violence to medical ethics.</p><p>Andy\'s international work has taken him to more than 20 countries on four continents, where he provides training and counsel on agricultural research, vaccine development, and public health interventions to control diseases of the developing world. He speaks Spanish fluently, having lectured and conducted media outreach in multiple Latin American countries.</p><p>In 2014, Andy was selected as a Rockefeller Foundation Bellagio Center Resident Fellow, joining 15 other policymakers, nonprofit leaders, artists and public advocates from around the world.</p><p>Before starting his firm, he was liaison with the public and primary spokesperson for the Robert Wood Johnson Foundation, the largest health philanthropy in the United States. Prior to that, he served as public information officer for the President\'s Commission on Medical Ethics. He was also a legislative assistant for health and education policy in the U.S. House of Representatives.</p><p>Andy has a Bachelor of Arts degree from Duke University, and a Master\'s degree in Business Administration from the University of Maryland. Father of two 20-something children (Alex and Molly), he lives near Washington, D.C., with his wife Hope and their dog Mo.</p>')
			},
			{
				name : 'Benedict Carey',
				organization : 'New York Times',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Carey-auth-photo-c-Soo-Jeong-Kang.jpg',
				bio : $sce.trustAsHtml('<p>Benedict Carey is an award-winning science reporter for <em>The New York Times</em>, and one of the newspaper\'s most-emailed reporters.  He graduated from the University of Colorado with a bachelor\'s degree in math and from Northwestern University with a master\'s degree in journalism, and has written about health and science for twenty-five years.</p>')
			},
			{
				name : 'Ann Elizabeth Christiano',
				organization : 'Frank Karel Chair',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/christiano.jpg',
				bio : $sce.trustAsHtml('<p>Ann Christiano is the the Frank Karel Chair in Public Interest Communications at the University of Florida College of Journalism and Communications. She is obsessive about connecting those who speak for the greater good with each other, and with timely and relevant scholarship that can help them do their work even better. She is developing a program in the newly-emerging discipline of public interest communications, which uses the tools of public relations and journalism to create positive social change.</p><p>As part of that work, she works closely with students and leaders in the field to organize the annual frank gathering, the only annual meeting for people who have dedicated their careers to the practice or study of public interest communications.</p>')
			},
			{
				name : 'Dave Clayton',
				organization : 'Neimand Collaborative',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/clayton.jpg',
				bio : $sce.trustAsHtml('<p>Dave\'s talent is understanding how people relate to issues, organizations, products and programs. A problem solver with an analytic bent for where people hold shared motivations, Dave leads our analysis and research efforts and identifies strategic solutions. He provides an invaluable bridge from research to action, making sure our brand, message and creative solutions remain grounded in meeting client objectives. He works with clients on projects from inception through training and long-term consulting. Growing up in Salt Lake City, Utah, Dave completed studies in psychology and physics at Brigham Young University before earning his doctorate in clinical psychology at the University of North Carolina-Chapel Hill. He left the clinical faculty at BYU\'s counseling center in 2001 and moved to D.C. to focus on strategic research and communications. Dave and his wife started their family of four in Chapel Hill, adding children at each stop along the way - and one carbon cyclocross bike that he rides into work each day regardless of rain, sleet, snow, ice, delivery vans on L Street or clueless tourists on the Mall.</p>')
			},
			{
				name : 'Whitney Dow',
				organization : 'Documentary Filmmaker',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/WBD-HeadshotNew1.jpg',
				bio : $sce.trustAsHtml('<p>Whitney Dow is a documentary filmmaker and educator whose work has been screened by numerous film festivals, cultural institutions and television networks around the world. His director and producer credits include, Two Towns of Jasper, I Sit Where I Want: The Legacy of Brown v. Board of Education, Unfinished Country, When the Drum is Beating, Freedom Summer, The Undocumented and Banished: How Whites Drove Blacks Out of Town in America. He is the recipient of the George Foster Peabody Award, Alfred I. duPont Award, Anthony Radziwill Documentary Achievement Award, the Beacon Award and the Duke University Center for Documentary Studies Filmmaker Award as well as many film festival honors. He teaches filmmaking and interactive storytelling at Hunter College and is producing the feature documentary Among the Believers.</p><p>Dow has been a guest lecturer at many universities, and worked in dozens of High schools across the country in partnership with Facing History and Ourselves who have built curriculums around his films. He is currently working in partnership with PBS on the ongoing interactive documentary series Whiteness Project which examines how white Americans process their ethnic identity.</p>')
			},
			{
				name : 'Chip Giller',
				organization : 'Grist',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/chip_alt_c.jpg',
				bio : $sce.trustAsHtml('<p>Chip Giller founded Grist in 1999, intent on using a new type of journalism to engage the next generation on environmental issues. Grist, which publishes online, now has an audience of more than 2 million, and has been especially successful reaching readers in their 20s and 30s. Readers follow Grist.org for information, inspiration, and conversation-as well as an injection of much-needed humor.</p><p>Giller has been honored with a Heinz Award for launching the country\'s most influential green media platform, and been named a TIME magazine "Hero of the Environment." He has been featured for his work in such outlets as Vanity Fair, Newsweek, and Outside, and appeared on broadcast programs including NBC\'s Today show. Before launching Grist, Giller was editor of Greenwire, the first environmental news daily. He and his family live on Vashon Island, outside of Seattle.</p>')
			},
			{
				name : 'Kristen Grimm',
				organization : 'Spitfire Strategies',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Kristen-Grimm-headshot.jpg',
				bio : $sce.trustAsHtml('<p>As the founder and president of Spitfire Strategies, Kristen Grimm has extensive experience conceiving, implementing and managing smart programs that create lasting social change. She has helped hundreds of nonprofits and foundations develop winning communication and campaign strategies to spur action around some of today\'s most pressing problems - and inspire many more people to get involved. She has reformed, reframed and re-imagined critical issues ranging from restoring the Gulf of Mexico after the BP oil spill to protecting Americans\' online privacy rights to making sure all kids have access to a good education, nutritious food and quality health care.</p><p>Kristen also trains. A lot. She enjoys teaching others the tricks of her trade and helping them reach those a-ha moments that give oomph to their communication and campaign efforts. She is the mastermind behind Spitfire\'s Smart Chart, Just Enough Planning Guide and Discovering the Activation Point, among other big think pieces. She loves creating messages and master narratives that resonate - especially when the good guys use them to shut down their opposition and the naysayers. She thinks fast in a crisis, is deft at drawing phenomenal visionary speech out of nonprofit leaders and is someone you want in your corner when you\'re ready to go big.</p><p>Before Spitfire, Kristen worked as a fellow at the Vietnam Veterans of America Foundation (VVAF) where she focused on banning landmines, reforming the death penalty and criminal justice systems, and reducing the threat of nuclear war. She was previously the president and chief operating officer of Fenton Communications, where she wrote NOW HEAR THIS: The Nine Laws of Successful Advocacy Communications.</p><p>Kristen has a B.A. from Smith College. She currently serves on the boards of Grist and Alaska Wilderness League. She is a member of the 2014 Class of Henry Crown Fellows at the Aspen Institute.</p>')
			},
			{
				name : 'Erin Hart',
				organization : 'Spitfire Strategies',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/erin-hart.jpeg',
				bio : $sce.trustAsHtml('<p>Erin believes that communication is a powerful driver for social change. She\'s worked with foundations, nonprofits, government agencies and more to help them engage their audiences and develop programs that make a difference for people\'s health, the environment and social justice.</p><p>Before coming to Spitfire, Erin served as Fenton\'s chief client officer and built the Gordon and Betty Moore Foundation\'s first communication department. During her time at the Foundation, she refreshed the organization\'s identity and built an online presence to help people better communicate the Foundation\'s focus and forge partnerships in science, patient care and the environment. She also worked with grantees to showcase the importance of scientific research and support work including the Earthquake Early-Warning System and Thirty-Meter Telescope that\'s being built on Mauna Kea.</p><p>Erin has developed public education campaigns - including the importance of growing and diversifying the healthcare workforce. This statewide campaign with The California Wellness Foundation included outreach to decision makers and the successful Health Jobs Start Here for youth and young adults. At her own firm and GolinHarris, Erin worked with the American Legacy Foundation - and its popular truth campaign - and state and local health departments to develop tobacco-control campaigns that would prevent youth from starting to smoke. She also developed communications and marketing plans for smoking cessation campaigns across the country.</p>')
			},
			{
				name : 'Ben Jaffe',
				organization : 'Preservation Hall Jazz Band',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/bencolor.jpg',
				bio : $sce.trustAsHtml('<p>As son of co-founders Allan and Sandra Jaffe, Ben has lived his whole life with the rhythm of the French Quarter pulsing through his veins. Raised in the company of New Orleans\' greatest musicians, Ben returned from his collegiate education at Oberlin College in Ohio to play with the group and assume his father\'s duties as Director of Preservation Hall. Today he serves as Creative Director for both PHJB and the Hall itself, where he has spearheaded such programs as the New Orleans Musicians Hurricane Relief Fund.</p><p>The PHJB began touring in 1963 and for many years there were several bands successfully touring under the name Preservation Hall. Many of the band\'s charter members performed with the pioneers who invented jazz in the early twentieth century including Buddy Bolden, Jelly Roll Morton, Louis Armstrong, and Bunk Johnson. Band leaders over the band\'s history include the brothers Willie and Percy Humphrey, husband and wife Billie and De De Pierce, famed pianist Sweet Emma Barrett, and in the modern day Wendell and John Brunious. These founding artists and dozens of others passed on the lessons of their music to a younger generation who now follow in their footsteps like the current lineup.</p>')
			},
			{
				name : 'Bobby Jones',
				organization : 'Millennial Marketing Expert and Author',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Bobby-Jones.jpg',
				bio : $sce.trustAsHtml('<p>Bobby Jones is considered one of the nation\'s most respected experts in youth marketing. As an entrepreneur, strategist and active participant in their world, Bobby has traveled the globe engaging young people and helping brands understand this generation\'s true values and passions. Bobby has leveraged his knowledge and talents to develop innovative, award-winning campaigns and strategies across a variety of categories from public interest, automotive and media to footwear and fashion.</p><p>Bobby\'s expertise has been noted in The Wall Street Journal, Sports Illustrated, E-Marketer and USA Today. Prior to joining Octagon, where he serves as Vice President and head of Access, Octagon\'s multicultural and millennial marketing group, Bobby was co-founder of Alloy Access, the leading multi-cultural insights and strategy agency in the US. Currently, Bobby is an active board member with youth organization Peace First where he helped to launch the Peace First Prize - a Nobel Peace Prize for youth, in 2013. He is also co-writing his first book called "Good is the New Cool" dedicated to helping brand marketers use their talents and resources to grow their brands in cool ways while impacting a greater social good. Bobby, a proud Washington, DC native, currently lives in Brooklyn, NY with his wife and young son, Miles.</p>')
			},
			{
				name : 'Yoo-Jin Kang',
				organization : 'Frank Karel Fellow',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Yoo-Jin-Kang-.jpeg',
				bio : $sce.trustAsHtml('<p>Yoo-Jin Kang is a graduating senior at the University of Maryland Baltimore County, studying language and cultural studies and interdisciplinary studies with a focus in the psychosocial and cultural perspectives on violence. A member of the Frank Karel Fellows, Class of 2014, Yoo-Jin interned with Trust for America\'s health, a non-profit non-partisan organization dedicated to saving lives by protecting the health of every community and working to make disease prevention a national priority. Yoo-Jin hopes to pursue her Masters in Public Health for the upcoming Fall.</p>')
			},
			{
				name : 'Ross Kauffman',
				organization : 'Documentary Filmmaker',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/RLK-HEADSHOT-2013.small_.jpeg',
				bio : $sce.trustAsHtml('<p>Ross Kauffman is the Academy award-winning director, producer, cinematographer and co-editor of the documentary feature <em>BORN INTO BROTHELS</em>.</p><p>His latest project, <em>E-TEAM</em> (directed with Katy Chevigny), a Netflix Original documentary feature about four intrepid Human Rights investigators, recently debuted at The Sundance Film Festival 2014 and won the Best Cinematography Award for a Documentary Feature.</p><p>From the war zones of Libya to the front lines of Kashmir, Ross has filmed around the world. He was a cinematographer on <em>HALF THE SKY</em>, a landmark transmedia project inspired by Nicholas Kristof and Sheryl WuDunn\'s best-selling book of the same name and has directed short films for NGO\'s around the world.</p><p>Ross also served on the board of Kids With Cameras, a non-profit organization that aims to better the lives of children from the red light district of Kolkata. After seven years of fundraising, our efforts resulted in the start of construction of Hope House, a nurturing safe haven where as many as 100 girls from Kolkata\'s red light district will live in order to develop the strength and skills to change their own circumstances.</p><p>Ross is currently a freelance director for Desantis Breindel, a B2B Branding and Marketing agency based in New York City, where he specializes in short form socially conscious branded content for clients as diverse as GE, The Robert Wood Johnson Foundation and Goldman Sachs 10,000 Women Initiative. In association with Desantis Breindel, directed the short film <em>Fire With Fire</em> about the oncology unit at the University of Pennsylvania, as they attempt to develop a cure for leukemia using the HIV virus. The film went viral and collected over 4.5 million hits and is currently being shown around the world to spread the word about this revolutionary new treatment.</p><p>He is currently an adjunct professor at The School of Visual Arts Social Documentary Masters Program. In addition, Ross has guest lectured at high schools and universities worldwide.</p><p>In 2014, Ross co-founded and serves as Creative Director of Fictionless, a media company specializing in documentary film and branded content.</p>')
			},
			{
				name : 'Anastasia Khoo',
				organization : 'Human Rights Campaign',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Anastasia-Khoo-0050.jpg',
				bio : $sce.trustAsHtml('<p>Anastasia Khoo is the Marketing Director for the Human Rights Campaign. In this capacity, Khoo has overseen consistently innovative organizational marketing strategies-driving forward HRC\'s work in the areas of digital media, advertising and public relations.</p><p>Nowhere has this leadership been more notable than in the record-breaking "red equal sign" campaign in 2013. As historic marriage equality cases reached the United States Supreme Court, Khoo developed a strategic campaign to give HRC supporters an opportunity to show their support for marriage and be a part of history by changing their Facebook profile picture to a red-and-pink version of the HRC logo. In just a few short days, as many as 10 million people used the image on social media-including celebrities, major corporations and leading politicians. The logo was named 2013′s "Symbol of the Year" and Facebook declared the campaign the most successful viral effort in the site\'s history.</p><p>Khoo is a widely-sought commentator on marketing and digital media issues giving interviews in a wide variety of publications including The New Yorker, Washington Post, Stanford Social Innovation Review and Marketing Power. She\'s given celebrated presentations at conferences like The Guardian\'s Activate London Summit, Mashable Social Good and SXSW. And she continues to volunteer her time to share what she\'s learned with other socially-minded nonprofits and brands.</p><p>Her work has garnered top honors including Mashable\'s "Best Social Media Campaign", PR Week\'s Best Digital Campaign, SXSW "Best Digital Campaign", "Best Social Media Campaign" and the highly-coveted "Best in Show." Khoo was also named "Digital Innovator of the Year."</p><p>Prior to joining HRC, Khoo spent six years in the environmental movement with Greenpeace developing its communications and brand strategy as well as collaborating on a variety of high-profile corporate and grassroots campaigns. She has a bachelor\'s degree from Dickinson College.</p>')
			},
			{
				name : 'Jenny Lawson',
				organization : 'New York Times Best-selling Author',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Jenny-Lawson-highres-courtesy-of-authorWEB-1.jpg',
				bio : $sce.trustAsHtml('<p>Jenny Lawson, aka The Bloggess, is the <em>New York Times</em> bestselling author of <em>Let\'s Pretend This Never Happened: (A Mostly True Memoir)</em> as well as a columnist and blogger. Her personal blog, The Bloggess, averages millions of page views per month. She is one of the most popular bloggers on Twitter with over 350,000 followers and growing daily. Jenny has been a regular contributor to the online Houston Chronicle since 2006 and also writes a popular advice column and satirical sex column. Jenny lives in Texas Hill Country with her husband and daughter.</p>')
			},
			{
				name : 'Yael Lehmann',
				organization : 'The Food Trust',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Yael-Lehmann.jpg',
				bio : $sce.trustAsHtml('<p>Yael Lehmann is executive director of The Food Trust, a nonprofit founded in 1992, which strives to make healthy food available to all. The Food Trust\'s work has been described by Time Magazine as being a "remarkable success" for increasing the availability of fresh fruits and vegetables in schools and reducing the number of students becoming overweight by 50 percent. In her tenure at The Food Trust, Yael has directed the growth of the organization\'s farmers\' markets, nutrition education programs, food retail development initiatives and other programs to promote access to affordable, nutritious food in lower-income communities. Yael has a bachelor\'s degree from the University of California at Berkeley and a master\'s degree from the University of Pennsylvania\'s School of Social Policy and Practice. In addition to her professional accomplishments, Yael is a mother and the bass player for "Happy Accident," a band that plays locally in Philadelphia and includes her husband Blake and Brian "Bucky" Lang.</p>')
			},
			{
				name : 'Mark Little',
				organization : 'Storyful',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Head-shot.png',
				bio : $sce.trustAsHtml('<p>Mark Little is the founder of Storyful, the world\'s first social media news agency. He leads a team of journalists and technologists who discover and verify the most compelling content on platforms like YouTube and Twitter. His company works with the biggest news organizations and social networks in the world, including ABC News, Facebook, the BBC and the <em>New York Times</em>.</p><p>Storyful\'s Headquarters are in Ireland. The company was acquired by News Corp in December 2013 and is currently expanding its operations in the United States and Asia.</p><p>Mark has more than two decades of experience in journalism. He was an award-winning foreign correspondent for the Irish national TV station RTE. He has covered some of the biggest stories of our age, including the war in Iraq and Afghanistan and the election of Barack Obama.</p>')
			},
			{
				name : 'Katie Loovis',
				organization : 'GlaxoSmithKline',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/loovis.jpg',
				bio : $sce.trustAsHtml('<p>Katie Loovis is director of U.S. community partnerships and stakeholder engagement for GlaxoSmithKline (GSK), a global health care company that helps millions of people around the world do more, feel better, and live longer. In this role, Katie is responsible for providing leadership and shaping strategy for GSK\'s philanthropy in the US at the national, state, and local levels, and building relationships with key stakeholders.</p><p>Prior to GSK, Katie served as chief operating officer for Achieving the Dream - a national nonprofit leading the nation\'s most comprehensive nongovernmental reform network for community college student success. At Achieving the Dream, Katie was responsible for managing day-to-day operations, coordinating long-term planning, directing all strategic communications and marketing, and serving as secretary to the Board of Directors.</p>')
			},
			{
				name : 'Sophia McClennen',
				organization : 'Penn State University',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/sophia-3.jpg',
				bio : $sce.trustAsHtml('<p>Sophia A. McClennen is Professor of International Affairs and Comparative Literature at Penn State University and founding director of the Center for Global Studies.  She writes about the intersections between culture, politics, and society. Recently she has focused on the intersections between satire and social crisis. She has written eight books; her latest (with millennial co-author Remy M. Maisel), <a href="http://www.amazon.com/Is-Satire-Saving-Our-Nation/dp/1137427965" target="_blank"><em>Is Satire Saving Our Nation? Mockery and American Politics</em></a>, is about the role of satire in the current U.S. political landscape. She regularly writes for mainstream media outlets including <a href="http://www.salon.com/writer/sophia_a_mcclennen/" target="_blank"><em>Salon</em></a> and the <a href="http://www.huffingtonpost.com/sophia-a-mcclennen" target="_blank"><em>Huffington Post</em></a> and can be found on Twitter at <a href="https://twitter.com/mcclennen65" target="_blank">@mcclennen65</a>.</p>')
			},
			{
				name : 'Diane McFarlin',
				organization : 'University of Florida',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Dianes-headshot.jpg',
				bio : $sce.trustAsHtml('<p>Diane McFarlin, JM 1976, is dean of the <a href="http://www.jou.ufl.edu" target="_blank">College of Journalism and Communications</a> at the <a href="http://ufl.edu/" target="_blank">University of Florida</a>. She began her journalism career in high school and took a reporting job in Sarasota after earning her degree at UF. McFarlin rose through the ranks to become managing editor of the Sarasota (FL) Herald-Tribune at 30. She was named executive editor of The Gainesville Sun three years later and then returned to the Herald-Tribune, serving as executive editor for a decade and publisher for 13 years. Under her leadership, the Herald-Tribune Media Group, the largest media company in Southwest Florida, was touted as an industry leader in media convergence and digital innovation.</p><p>She became dean of the UF College of Journalism and Communications in January 2013. In this role, she has expanded interdisciplinary initiatives, established a central hub for professional advising and student services, and increased research productivity through top faculty hires and increased funding. In addition to academic excellence, the college\'s hallmark is the professional immersion opportunities it offers students. Venues include the multimedia Innovation News Center, GatorVision sports production, and The Agency, an integrated communication agency opening in early 2015. Each of these programs is led by professionals, staffed by students and inspired by faculty.</p>')
			},
			{
				name : 'Ben Milder',
				organization : 'Burness Communications',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/milder-1.jpg',
				bio : $sce.trustAsHtml('<p>Ben Milder, Senior Vice President and Director of the Public Policy Team, joined Burness Communications in 1999. He leads the company\'s policy initiatives with non-profit organizations, developing and implementing strategies to advance our clients\' ideas in the policy world. His work involves regular contact with Congress, the executive branch, interest groups, professional associations and think tanks.</p><p>The Policy team supports a wide array of the company\'s clients across a diverse set of issues in health and health care, from combatting the nation\'s childhood obesity epidemic to advancing transformative ideas to improve the health of vulnerable populations to spreading new models of medical education and care delivery.</p><p>Prior to joining Burness, Ben spent two years with the Washington, D.C., firm of Preston Gates Ellis & Rouvelas Meeds, and served as an aide to U.S. Senator Mark O. Hatfield. A northern California native, Ben holds a bachelor\'s degree in Political Science from Willamette University in Salem, Oregon.</p>')
			},
			{
				name : 'David Morse',
				organization : 'The Atlantic Philanthropies',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/David-Morse-Placeholder-IMG-0752-head-c.jpg',
				bio : $sce.trustAsHtml('<p>David Morse is chief communications officer for The Atlantic Philanthropies, a global foundation advancing opportunity and lasting change for those who are unfairly disadvantaged or vulnerable to life\'s circumstances. A limited life philanthropy scheduled to make its final grants in 2016, Atlantic focuses particularly on issues of aging, children and youth, population health and reconciliation and human rights in the Republic of Ireland, Northern Ireland, South Africa, the U.S. and Viet Nam. As a member of Atlantic\'s senior leadership team, David\'s responsibilities include developing, leading and executing communications strategy; counseling Atlantic\'s board and executive leadership on communications, media and policy issues; and overseeing program and legacy communication initiatives and the foundation\'s digital platforms.</p><p>David has had an eclectic career leading public policymaking, advocacy, strategic communications and planning in the non-profit sector, philanthropy and government. He\'s been a "shoe-leather" epidemiologist for the New York State Department of Health; professional staff member for the U.S. Senate Committee on Labor and Human Resources; director of the President\'s Task Force on the Arts and Humanities; associate vice president for policy planning, director of federal relations and instructor in higher education and public policy at the University of Pennsylvania; chief public affairs officer for the Pew Charitable Trusts; vice president for communications for the Robert Wood Johnson Foundation; and senior fellow and interim vice president of Encore.org, a San Francisco-based nonprofit building a movement to promote encore careers-second acts for the greater good.. David earned a B.A. with honors from Hamilton College and a master\'s in international relations from the Johns Hopkins University. He has served on several boards of nonprofit organizations, teaches a course on public policy, advocacy and strategic communications at the University of Southern California, has three adult children and lives in Pennington, NJ with his wife, dog and a cat that thinks he\'s a dog.</p>')
			},
			{
				name : 'Rich Neimand',
				organization : 'Neimand Collaborative',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/RichNeimand-c.jpg',
				bio : $sce.trustAsHtml('<p>Rich works at the confluence of politics, policy and consumerism to create social and economic change. He has built a successful career on his ability to synthesize disparate information into clear, concise and compelling persuasion. A graduate in English from UCLA, Rich was pummeled by semioticians and structuralists long before the notion of seizing issues by seizing the language used to describe them became fashionable. He has spent much of his subsequent career helping people gain power by gaining control over words and images. He develops messages that tap into attitudes, touch shared values and unite different audiences around common objectives. Rich is skilled in branding, strategic message and creative development, naming and renaming-and in providing solutions to change seemingly intractable public perceptions.</p><p>Steeped in issues such as early childhood development, health care, education, conservation, financial inclusion and human rights, Rich\'s clients have included the First Five Years Fund, AdvaMed, the American Heart Association, Nobel Prize laureate economist James Heckman, MasterCard, the Pancreatic Cancer Action Network, ClimateWorks, the National Health Council, America\'s Essential Hospitals, the William & Flora Hewlett Foundation, the Nature Conservancy, the Robert Wood Johnson Foundation, the United Nations Development Programme, the Bill & Melinda Gates Foundation and a host of public campaigns and causes.</p>')
			},
			{
				name : 'Brendan Nyhan',
				organization : 'Dartmouth College',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/brendan-nyhan.jpg',
				bio : $sce.trustAsHtml('<p>Brendan Nyhan is an assistant professor in the Department of Government at Dartmouth College. His research, which focuses on political scandal and misperceptions about politics and health care, has been published or is forthcoming in journals including the American Journal of Political Science, British Journal of Political Science, Political Analysis, Political Behavior, Political Psychology, Pediatrics, Medical Care, Journal of Adolescent Health, and Social Networks. He is also a contributor to the New York Times politics/policy website The Upshot. Previously, he served a media critic for Columbia Journalism Review; co-edited Spinsanity, a non-partisan watchdog of political spin that was syndicated in Salon and the Philadelphia Inquirer, and co-authored <em>All the President\'s Spin</em>, a <em>New York Times</em> bestseller.</p>')
			},
			{
				name : 'John Passacantando',
				organization : 'Eco-Accountability Project',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/John-Passacantando.jpg',
				bio : $sce.trustAsHtml('<p>John Passacantando\'s career has taken him from Wall Street to philanthropy to a leading role in the global fight to stop climate change. He worked for Jude Wanniski -the "high priest" of supply side economics in the US - and is a committed practitioner of non-violent civil disobedience as taught by Mahatma Gandhi and Martin Luther King, Jr. He has a master\'s degree in economics from New York University, as well as a record of a dozen arrests for engaging in peaceful protest. He has been quoted in most major newspapers, appeared on major TV and radio news programs and has been a regular commentator on environmental issues.</p><p>Passacantando completed eight years as executive director of Greenpeace USA in 2008, the longest serving director in the history of the organization. Prior to Greenpeace, Passacantando founded and ran Ozone Action (1992-2000), the country\'s first national non- profit focusing exclusively on global warming. He also served as the executive director of the Florence and John Schumann Foundation (1989-1992), where he directed resources to the grassroots renewal of democracy.</p><p>Passacantando now runs the Eco-Accountability Project, providing research and analysis to support the environmental community. He also teaches strategy and leadership at American University\'s School of International Service in the Social Enterprise Program.</p>')
			},
			{
				name : 'Steven Pinker',
				organization : 'Author',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Steven-Pinker-2011-author-photo.jpg',
				bio : $sce.trustAsHtml('<p>Steven Pinker is a Harvard College Professor and the Johnstone Family Professor of Psychology at Harvard University. He is the best-selling author of numerous books, including, most recently, <em>The Sense of Style: A Writing Guide for the 21st Century</em>, <em>The Better Angels of Our Nature: Why Violence Has Declined</em>, and <em>The Stuff of Thought: Language as a Window into Human Nature</em>. His previous works include <em>The Blank Slate</em> and <em>How The Mind Works</em>, which were both Pulitzer Prize finalists. Dr. Pinker has been listed on TIME magazine\'s "100 Most Influential People in The World," as well as on Foreign Policy\'s list of "The World\'s Top 100 Public Intellectuals." He has received awards and honors from the National Academy of Sciences, the Cognitive Neuroscience Society, and the American Psychological Association.</p>')
			},
			{
				name : 'Ai-Jen Poo',
				organization : 'National Domestic Workers Alliance',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/ai-jen-headshot-lores.jpg',
				bio : $sce.trustAsHtml('<p>Ai-jen Poo, Director of the National Domestic Workers Alliance (NDWA) and Co-director of the Caring Across Generations campaign, has been organizing immigrant women workers since 1996. In 2000 she co-founded Domestic Workers United, the New York organization that spearheaded the successful passage of the state\'s historic Domestic Workers Bill of Rights in 2010. In 2007, DWU helped organize the first national domestic workers convening, out of which formed the NDWA. As Co-director of Caring Across Generations, Ai-jen leads a movement that is inspiring thousands of careworkers, parents, grandparents, grandchildren, and lawmakers to work together to ensure that all people can mature in this country with dignity, security and independence.</p><p>Ai-jen serves on the Board of Directors of Momsrising, National Jobs with Justice, Working America, and the National Council on Aging. She is a 2014 MacArthur Foundation fellow, a 2013 World Economic Forum Young Global Leader, and was named to TIME\'s list of the 100 Most Influential People in the World in 2012. Other accolades include the Ms. Foundation Woman of Vision Award, the Independent Sector American Express NGen Leadership Award, and Newsweek\'s 150 Fearless Women list.</p>')
			},
			{
				name : 'Carlos Roig',
				organization : 'Home Front Communications',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Carlos.Roig-c.jpg',
				bio : $sce.trustAsHtml('<p>Carlos Roig is Executive Vice President of Media and Content Strategy at Home Front Communications, a Washington, D.C.-based firm. He designs and directs communications initiatives for a wide range of clients, with particular emphasis on content creation, audience engagement and sustained community building.</p><p>In addition to his work with Home Front, Carlos is a recipient of the <em>Teaching Excellence and Service Award</em> for his instruction in Georgetown University\'s graduate journalism program. His courses have spanned digital media strategy, entrepreneurial journalism and project management for news organizations.</p><p>Prior to joining Home Front, Carlos led the sitewide development of new online communities for USA Today. The collection of niche websites spanned an impressive and varied list of topics - from breaking news to presidential politics; from autos to green building; from pop culture to fantasy sports. He was a key player in the transformation of USA Today\'s newsroom, training journalists in the art and science of online community building and social media. He also directed the news organization\'s full digital coverage of the 2008 presidential campaign, election and inauguration.</p><p>Carlos\' academic and journalistic efforts have been honored with fellowships from the Knight Foundation, the Carnegie Corporation and the McCormick Foundation, which named him an inaugural McCormick Leadership Scholar at Northwestern University\'s Medill School. His investigative reporting on data mining and terrorism prosecutions has been featured in The Washington Post, and he is a former associate producer at NPR member station KQED (San Francisco), where he worked on the award- winning public affairs program, "Forum with Michael Krasny".</p><p>Carlos holds a master\'s degree in journalism from Northwestern University; a master\'s degree in Hispanic literature from New York University; and a bachelor\'s degree with high honors in cultural anthropology from the University of California at Berkeley.</p>')
			},
			{
				name : 'Jim Ross',
				organization : 'Jim Ross Consulting',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/JimRoss.JJ-005-Edit-1.jpeg',
				bio : $sce.trustAsHtml('<p>Jim Ross is a nationally recognized expert in communications, political strategy and public affairs with more than twenty years of campaign management, communications and public affairs experience.</p><p>Selected career highlights include being part of the effort to defeat incumbent U.S. Senator Gordon Smith (R-OR) and elect Senator Jeff Merkley (D-OR) (2008); leading the campaign to re-elect Governor Ted Kulongoski (D-OR) (2006) and running the campaign to elect Gavin Newsom Mayor of San Francisco (2003).</p><p>Since starting his San Francisco based firm in 2002, Jim has helped a diverse range of clients. <em>Jim Ross Consulting</em> produces media for the endorsed candidates of the Service Employees International Union Local 1021,has helped build a statewide small business organization in California and manages major communications efforts for <em>Fortune 50</em> corporations.</p><p>Before starting his own firm, Jim was Director of Public Affairs at Solem & Associates, one of California\'s oldest public relations and public affairs agencies.</p><p>Mr. Ross served as a special assistant to former San Francisco Mayor Frank Jordan overseeing a wide range of policy areas including Recreations and Parks, the Fine Arts Museums, the Department of Parking and Traffic and the Municipal Railway.</p><p>Mr. Ross has lectured at the Institute of Politics at Harvard University, the Institute of Governmental Studies at the University of California and at the University of San Francisco.</p><p>A graduate of St. Mary\'s College of California with a degree in Government and minors in Economics and History, Mr. Ross lives in Oakland, CA.</p>')
			},
			{
				name : 'Viviane Seyranian',
				organization : 'California State Polytechnic University',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/IMG_7993.jpeg',
				bio : $sce.trustAsHtml('<p>Dr. Viviane Seyranian is an Assistant Professor of Psychology at California State Polytechnic University, Pomona. She is a social psychologist who specializes in persuasion, communication, and social influence. Broadly speaking, her research examines psychological strategies that help individuals to overcome resistance to change and encourages them to engage in behavior that helps to bring about social change. Most recently, she wrote a theory of social change communication called <em>Social Identity Framing</em> (Seyranian, 2013, 2014), which underscores the key idea that shaping social identity through specific communication tactics is an important component of the change process. Whenever change is necessary, this theory may provide important insights into factors that advance success for leaders, communities, and organizations. In promoting environmental sustainability, for example, her research shows that using language that implicates social identity may help leaders to convince their followers to embrace renewable energy. Dr. Seyranian has received research funding from the John Randolf and Dora Haynes Foundation, the Bill and Melinda Gates Foundation, the University of Southern California, and Claremont Graduate University. She completed a postdoctoral fellowship at the University of Southern California after earning her Ph.D. and Master of Arts degree in social psychology from Claremont Graduate University and her Bachelor of Arts (cum laude) in psychology and government from Claremont McKenna College.</p>')
			},
			{
				name : 'Anat Shenker-Osorio',
				organization : 'Communications Expert, Researcher, and Political Pundit',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/DSC2264-c.jpg',
				bio : $sce.trustAsHtml('<p>Anat Shenker-Osorio is a communications expert, researcher and political pundit challenging the way dozens of organizations and political figures talk about the most pressing issues of our time. She\'s the author of <em>Don\'t Buy It: The Trouble with Talking Nonsense About the Economy</em>. As a strategic communications consultant, she has conducted multiple studies on how people reason about clean energy, education, economic justice, immigrants and women\'s rights. Past and present clients include: Center for Community Change, the Ford Foundation, America\'s Voice, Opportunity Agenda, Ms Foundation, We Belong Together, Congressional Progressive Caucus, Caring Across Generations and NEA, to name a few. Anat comments on political language for venues including <em>The Atlantic</em>, <em>Huffington Post</em>, Salon, the <em>Christian Science Monitor</em>, and <em>Boston Globe</em>.</p>')
			},
			{
				name : 'Sivan Sherriffe',
				organization : 'Frank Karel Fellow',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Sivan_Sherriffe-photo.jpg',
				bio : $sce.trustAsHtml('<p>Sivan Sherriffe is a senior at the George Washington University, majoring in journalism and mass communication. Sivan is the founding public relations chair of the Ubuntu Service Group, GWU\'s first multicultural community service group that aims to bring more multicultural students to serve in the DC community. Sivan worked with Greenpeace, the largest independent direct-action environmental organization in the world.</p>')
			},
			{
				name : 'Tom Shroder',
				organization : 'Journalist, Writer, and Editor',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/tom-shroder.jpg',
				bio : $sce.trustAsHtml('<p>Tom Shroder has been an award-winning journalist, writer and editor for more than 30 years. His book editing projects include two New York Times bestsellers; Overwhelmed: Work, Love, and Play When No One Has the Time (2014), by Brigid Sculte; and Top Secret America (2012), by Dana Priest and William Arkin. As editor of The Washington Post Magazine, he conceived and edited the story, Fatal Distraction, which was awarded the 2010 Pulitzer Prize for feature writing. He also edited and contributed to Pearls Before Breakfast, which was awarded the 2008 Pulitzer Prize for feature writing. In addition to being an author and editor of narrative journalism, Shroder is one of the foremost editors of humor in the country. He has edited humor columns by Dave Barry, Gene Weingarten and Tony Kornheiser, as well as conceived and launched the internationally syndicated comic strip, Cul de Sac, by Richard Thompson. His latest book, to be published in September, is Acid Test: LSD, Ecstasy, and the Power to Heal, a fascinating, transformative look at the therapeutic powers of psychedelic drugs, particularly in the treatment of PTSD, and the past fifty years of scientific, political, and legal controversy they have ignited. His 1999 book Old Souls: Compelling Evidence From Children Who Remember Past Lives, has become a classic of New Age literature. He is also the co-author, with former oil rig captain John Konrad,of Fire on the Horizon: The Untold Story of the Gulf Oil Disaster. It was singled out among all the Gulf oil disaster books by the LA Times, which said it "marries a John McPhee feel for the technology to a Jon Krakauer sense of an adventure turned tragic." Sebastian Junger, author of The Perfect Storm, called it, "one of the best disaster books I have ever read."</p><p>Shroder was born in New York City in 1954, the son of a novelist and a builder, and the grandson of MacKinlay Kantor, who won the Pulitzer Prize for his civil war novel "Andersonville." Shroder attended the University of Florida where he became Editor of the 22,000 circulation student daily newspaper despite the fact that he was an anthropology major (an affront for which the university\'s journalism faculty was slow to forgive him). After graduation in 1976, he wrote national award-winning features for the Fort Myers News Press, the Tallahassee Democrat, The Cincinnati Enquirer and the Miami Herald. At the Herald he became editor of Tropic magazine, which earned two Pulitzer Prizes during his tenure. In that same period, with humorist Barry and novelists Carl Hiaasen and Elmore Leonard, he concocted and edited "Naked Came the Manatee," a satirical serial novel that became a New York Times bestseller. In addition to Fire on the Horizon, Shroder is the author of "Old Souls: Compelling Evidence From Children Who Remember Previous Lives," a bestselling consideration of the life and work of Ian Stevenson, a University of Virginia psychiatrist and researcher who spent four decades investigating cases of small children who claimed to remember previous lives; and co-author of "Seeing the Light", a biography of Everglades naturalist photographer Clyde Butcher. His work "The Hunt for Bin Laden," edited from 15 years of coverage by The Washington Post, became the #1 selling Kindle Single on Amazon.</p><p>Shroder is also known for his creation, along with Barry and Weingarten, of the Tropic Hunt, which has become the Herald Hunt in Miami and the Post Hunt in Washington, a mass-participation puzzle attended by thousands each year.</p>')
			},
			{
				name : 'Amy Simon',
				organization : 'Goodwin Simon Strategic Research',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Amy-Simon-Headshot-2013.jpg',
				bio : $sce.trustAsHtml('<p>A partner at Goodwin Simon Strategic Research, Amy Simon brings 20 years of political experience to her work as a pollster and communications strategist. She conducts research on a variety of public policy issues and her clients include state and local government, non-profits, labor unions, and both political and candidate committees. She has worked on candidate and ballot measure campaigns at the federal, state and local level in over 40 states.</p><p>Prior to founding GSSR, she worked as a pollster at Bennett, Petts and Blumenthal and GLS Research. A former campaign manager, direct mail consultant, and political director before becoming a pollster, Ms. Simon helped elect pro-choice women at the Women\'s Campaign Fund and was an organizer on the Dukakis presidential campaign. Locally, Ms. Simon managed city council and state assembly races.</p><p>Ms. Simon serves on the Board of Directors of PeacePAC and Emerge America and is a contributing author to True to Ourselves, a collection of essays by prominent American women. Ms. Simon graduated with Honors from the University of Michigan in 1987. She studied at the Joint Program in Survey Methodology (Universities of Maryland and Michigan). She is a member of the American Association for Public Opinion Research and the American Association of Political Consultants.</p>')
			},
			{
				name : 'Joel Simon',
				organization : 'Committee to Protect Journalists',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Joel-Simon-headshot.jpg',
				bio : $sce.trustAsHtml('<p>Joel Simon is the executive director of the Committee to Protect Journalists (CPJ) and has written widely on media issues. He is a regular contributor to Slate and the Columbia Journalism Review, and his articles and commentary have appeared in the New York Review of Books, the New York Times, World Policy Journal, and other publications. He is also the author of Endangered Mexico: An Environment on the Edge and lives in Brooklyn with his family.</p>')
			},
			{
				name : 'David Sleeth-Keppler',
				organization : 'Humboldt State University; Strategic Business Insights',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Sleeth-Keppler.jpg',
				bio : $sce.trustAsHtml('<p>David Sleeth-Keppler is an assistant professor of sustainable marketing at Humboldt State University and Senior Consultant at Strategic Business Insights, where he supports commercial, non-profit and government research, strategy, and communication projects with social science insights. Much of his focus in recent years has been on finding ways to engage more Americans with solutions to climate change. His academic work, published in Psychological Science, the Journal of Consumer Psychology, and the Journal of Personality and Social Psychology, contributes to understanding the processes whereby people form judgments. He received his PhD in social psychology from the University of Maryland and spent 2 years as a post-doctoral fellow at the Stanford Graduate School of Business.</p>')
			},
			{
				name : 'Corey Souza',
				organization : 'S-Connection',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/SanchezFeb19_3_lowres-2.jpg',
				bio : $sce.trustAsHtml('<p>Corey Souza is owner/operator of S-Connection, LLC dedicated to connecting communities through cultural exchange. Through this organization, Corey and her husband Victor Souza produce cultural events with a broad network of performing artists. S-Connection Aerial Arts is just one of the company\'s many projects offering training and performances in a variety of circus arts. Corey is currently wrapping up a PhD in cultural anthropology at the University of Florida where her research focuses on Brazilian samba and carnival as representations of Brazilian nationalist ideology. Her dissertation "Samba, Mulatas and the Social Meaning of Carnival" highlights the role of the dancing mulatta within colonial, patriarchal and feminist discourses in a contemporary and complex society.</p>')
			},
			{
				name : 'Shankar Vedantam',
				organization : 'NPR',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Vedantam-Headshot-crdit-Gary-Knight.jpg',
				bio : $sce.trustAsHtml('<p>Shankar Vedantam was a highlight at frank 2014 and will join us again for 2015. He is the author of The Hidden Brain: How our Unconscious Minds Elect Presidents, Control Markets, Wage Wars and Save Our Lives. He is also a social science correspondent at NPR - National Public Radio. He was formerly a reporter at The Washington Post. From 2007 to 2009, he wrote the Post\'s Department of Human Behavior column. Vedantam travels widely to give talks that explore how the science of human behavior shapes corporate life, nonprofit institutions and public policy.</p><p>Vedantam has been invited to teach at several academic institutions, including Harvard University and Columbia University. He has served as a senior scholar at the Woodrow Wilson International Center for Scholars in Washington, and as a fellow at the Nieman Foundation at Harvard University.</p>')
			},
			{
				name : 'Jennifer Webber',
				organization : 'Jennifer Webber Public',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/JennWebber.JJ-028-Edit-c.jpg',
				bio : $sce.trustAsHtml('<p>Jennifer Webber is a public affairs and strategic communications consultant based in Oakland, California where she works with a broad range of clients including candidates for public office, nonprofit organizations, and advocacy groups to help them achieve their government relations, communications and political goals at national, state and local levels.</p><p>Webber specializes in message development, coalition building, project management and management consulting. Highly regarded for her candidate trainings, Webber is known for her direct approach, honest advice, and ability to find humor when needed. When being introduced at a recent workshop, Webber was asked to name her proudest professional moment. She named two: doggedly working to defeat a bill to establish a tip credit in Oregon while serving as the executive director of the Oregon Commission for Women in 1997, and managing the campaign to elect the first openly gay judge on any state\'s highest court in 2004 in Oregon. On November 4, 2014, she\'ll add working to pass an Oakland, California ballot initiative to raise the minimum wage and provide paid sick days to that list.</p><p>It was evident from an early age that Jennifer would work in politics or a related field. Labeled a "news junkie" by her mother when she was just ten years old, Jennifer rarely missed watching the evening news with her dad and always accompanied her parents to the polling place on Election Day. As a teenager, Jennifer worked for the County Clerk during elections making sure ballots were clean and smooth enough to be read by the tabulation machine. In this job, she developed a close but dysfunctional relationship with "hanging chad" and was not surprised when it wreaked havoc in the 2000 Presidential Election.</p><p>For three years prior to opening her Oakland-based consulting business, Webber served as Fortune 50 Company Safeway Inc.\'s Director of Public and Government Affairs for its Northern California Division which included 270 stores in Northern California, Hawaii and Northern Nevada and one of the largest distribution centers in North America. In this capacity, she oversaw the Division\'s media relations, government relations, community relations and charitable giving. In 2007, Webber was recognized with the company\'s Government Relations Achievement Award for outstanding work among all divisions in the company.</p><p>Webber holds a Master\'s Degree in U.S. History from the University of Notre Dame in Indiana and a Bachelor\'s Degree in Political Science and History with a minor in English and a certificate in Peace Studies from the University of Portland in Oregon.</p>')
			},
			{
				name : 'Lizz Winstead',
				organization : 'Activist, Comedian, Political Satirist, and Host of frank',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/lizz-winstead.jpg',
				bio : $sce.trustAsHtml('<p>Lizz Winstead is returning as <em>frank</em>\'s host. As co-creator and former head writer of <em>The Daily Show</em> and Air America Radio co-founder, she has helped change the very landscape of how people get their news.As a performer, Winstead brought her political wit to <em>The Daily Show</em> as a correspondent and later to the radio waves co-hosting <em>Unfiltered</em>, Air America Radio\'s mid-morning show, where she brought on board Hip Hop legend, Chuck D and political big brain Rachel Maddow.</p><p>Known as as one of the top political satirists in America, Winstead is currently touring the country, bringing her razor sharp insights to the stage selling out shows from LA to NYC.</p><p>Lizz\'s talents as a comedian and media visionary have been recognized by all the major media outlets including The New York Times, The Washington Post and Entertainment Weekly\'s 100 most Creative People issue. Winstead has made numerous stand-up appearances, including Comedy Central Presents, specials on HBO, VH-1, MTV and more. She can also be seen regularly doing hilarious and insightful commentary on MSNBC. Winstead has also written for The Guardian, The Wall Street Journal, The Huffington Post and regularly blogs at Sulia.com</p><p>Lizz also gives back. Her ongoing national comedy tour to benefit Planned Parenthood and NARAL has raised over 2 million dollars and was made into a documentary film, <em>Smear Campaign</em> just won "Best Documentary Comedy Short" at the Atlanta Documentary Film Festival.</p><p>Winstead\'s first book, <em>Lizz Free Or Die</em>, Essays, was released in 2012 to incredible reviews and the paperback was released in May of 2013. Lizz is currently working on a second book and has spearheaded Lady Parts Justice, a reproductive rights group fighting to return all 50 state legislatures to a pro-choice majority.</p>')
			},
			{
				name : 'Sheryl WuDunn',
				organization : 'Pulitzer Prize-Winning Journalist',
				image : 'http://frank.jou.ufl.edu/wp-content/uploads/2014/10/Sheryl-WuDunn-Headshot.jpg',
				bio : $sce.trustAsHtml('<p>The first Asian-American reporter to win a Pulitzer Prize, Sheryl WuDunn has journeyed through several industries, from banking to journalism and book writing, pulling together critical insights to bear upon her work. Most recently, she has written a new book, "A Path Appears," about spreading opportunity and making a difference in the world. Previously, she was co-author of "Half the Sky," about the oppression of women and girls around the world. Sheryl has used her immense talent as a writer, speaker and thought leader to advocate for those without the resources to advocate for themselves. Selected as one of <em>Newsweek\'s</em> "150 Women Who Shake the World," WuDunn has helped raise awareness about the challenges facing women, such as sex trafficking. A highly successful business executive and best-selling author, she currently works with entrepreneurs in new media, technology and social enterprise at Mid-Market Securities, a small investment banking boutique in NYC.</p>')
			}
		];
	}
]);