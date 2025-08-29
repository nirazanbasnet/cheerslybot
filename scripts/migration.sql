
-- Clear existing data
DELETE FROM anniversary_configs;
DELETE FROM birthday_configs;
DELETE FROM profiles;

-- Insert all profiles
INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Bibek Khadgi', 'bibek@jobins.jp', '9860561172', 'J3', 'UI/UX Designer Lead', 'April 2, 2018', 'Dallu, Kathmandu', 'B+', 'December 25, 1991', '', '9886293996');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Bibek Khadgi on your work anniversary! 🎖️🎉

Your creative vision and leadership in UI/UX design have been instrumental in shaping our projects. 🎨✨

Thank you for your dedication and for making our designs not just functional, but beautiful! 🚀💫

Here''s to many more years of innovation and success! 🥂🌟', '', '', '2025-08-29T04:28:57.667Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Rajendra Prajapati', 'rajendra@jobins.jp', '9808394195', 'J3', '', 'April 6, 2020', 'Madhyapur thimi, Bhaktapur', 'AB+', 'May 4, 1993', '', '9813160616');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Rajendra Prajapati on your work anniversary! 🎖️🎉

Your technical expertise and problem-solving skills continue to drive our success forward. 💻⚡

Thank you for your commitment and for being such a valuable part of our team! 🤝🚀

Wishing you continued growth and achievements! 🎯✨', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES ('U01FDQQDCA1', 'Sandip Bhandari', 'sandip_b@jobins.jp', '9811871835', 'J2', 'UI/UX Designer', 'December 1, 2020', 'Parsa, Chitwan', 'O+', '05/04/1993', '', '9816266592');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), ':tada::birthday: Happy Birthday, <@U01FDQQDCA1>! :birthday::tada:
 Wishing you a day full of color, creativity, and celebration — and a year ahead bursting with fresh ideas, bold moves, and design magic! :rainbow::sparkles::lower_left_paintbrush:
 Your vision, craft, and calm creative energy continue to inspire everyone at JoBins. Whether you’re sketching wireframes, polishing pixels, or shaping seamless user journeys, you do it all with precision, empathy, and style. :brain::art::desktop_computer:
 You don’t just design screens — you design experiences. You bring ideas to life, make complex things feel simple, and always keep the user at the heart of everything. Today, we want you to know just how much we admire your talent, your mindset, and the humble brilliance you bring to the team every day. :raised_hands::blue_heart:
 Here’s to beautiful layouts, bold thinking, and new horizons ahead. May this new year bring you inspiration, success, joy — and of course, a ridiculously good slice of cake. :birthday::partying_face::gift:
 Happy Birthday once again, <@U01FDQQDCA1>!
 Let’s keep designing the future — together. :jigsaw::rocket:
 #OneJoBins #DesignLegend #PixelPerfectBirthday #OneTeamOneDream :balloon::tada::lower_left_paintbrush:', 'sandip-bhandari.png', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations <@U01FDQQDCA1> on your work anniversary! 🎖️🎉

Your creative flair and attention to detail in UI/UX design bring our projects to life! 🎨💫

Thank you for your passion and for making our interfaces both beautiful and user-friendly! 🌟🚀

Here''s to more amazing designs and successful projects! 🎊✨', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES ('U0318FEMBDX', 'Kushal Raj Shrestha', 'kushal@jobins.jp', '9841567626', 'J4', '', 'February 1, 2022', 'Nayabazar, Kathmandu', 'A+', 'October 30, 1988', '', '14359566');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), ':tada::birthday: Happy Birthday, <@U0318FEMBDX>! :birthday::tada:
 May the year ahead be full of exciting opportunities, personal growth, and unforgettable moments — all under the spirit of One JoBins. :handshake::skin-tone-2:
 Your energy, dedication, and positivity continue to inspire us every day. :balloon::star2:
Let’s make this next chapter even more amazing — together as one team, one dream. :gift::rocket:
 Have the happiest birthday ever, <@U0318FEMBDX>! :partying_face::confetti_ball: You deserve nothing but the best — today and always. :sparkling_heart::raised_hands:', 'kushal-raj-shrestha.jpg', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations <@U0318FEMBDX> on your work anniversary! 🎖️🎉

Your leadership and technical prowess have been the backbone of our team''s success! 💪🚀

Thank you for your dedication, mentorship, and for always pushing us to achieve excellence! 🌟💫

Wishing you continued success and many more milestones! 🎯🎊', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Bhola Kumar Khawas', 'bhola@jobins.jp', '9811006314', 'J2', 'Fullstack/PM', 'November 7, 2022', 'Belbari-8, Raijhar, Bhola Rice Mill', 'B+', 'February 21, 1995', '', '9817381221');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Bhola Kumar Khawas on your work anniversary! 🎖️🎉

Your full-stack expertise and project management skills keep our team running smoothly! 💻⚙️

Thank you for your versatility and for being such a reliable team player! 🤝🚀

Here''s to more successful projects and continued growth! 🎯✨', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES ('U04D4LVHWJ1', 'Nirajan Basnet', 'nirajan@jobins.jp', '9849056406', 'J4', '', 'December 1, 2022', 'Nakkhudol, Lalitpur', 'A+', 'August 18, 1990', '', '9869242167');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), ':tada::birthday: Happy Birthday, <@U04D4LVHWJ1>! :birthday::tada:
 May the year ahead be full of exciting opportunities, personal growth, and unforgettable moments — all under the spirit of One JoBins. :handshake::skin-tone-2:
 Your energy, dedication, and positivity continue to inspire us every day. :balloon::star2:
Let’s make this next chapter even more amazing — together as one team, one dream. :gift::rocket:
 Have the happiest birthday ever, <@U04D4LVHWJ1>! :partying_face::confetti_ball: You deserve nothing but the best — today and always. :sparkling_heart::raised_hands:', 'nirajan-basnet.png', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations <@U04D4LVHWJ1> on your work anniversary! 🎖️🎉

Your technical leadership and innovative solutions continue to elevate our team! 💻🚀

Thank you for your dedication and for being such an inspiring team member! 🌟💫

Wishing you continued success and many more achievements! 🎯🎊', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Binaya Giri', 'binayak@jobins.jp', '9849554820', 'J2', '', 'May 8, 2023', 'PU Gate, Pokhara', 'B+', 'September 29, 1994', '', '9851126309');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Binaya Giri on your work anniversary! 🎖️🎉

Your fresh perspective and technical skills bring new energy to our projects! ⚡💻

Thank you for your enthusiasm and for being such a valuable addition to our team! 🌟🚀

Here''s to more growth and successful collaborations! 🎯✨', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Tshering Lama', 'tshering@jobins.jp', '9818007774', 'J3', '', 'May 9, 2023', 'Hattidanda, Gothatar, Kathmandu', 'O-', 'August 8, 1990', '', '9851340774');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Tshering Lama on your work anniversary! 🎖️🎉

Your technical expertise and collaborative spirit make you an invaluable team member! 💻🤝

Thank you for your dedication and for always bringing your best to every project! 🌟🚀

Wishing you continued success and many more milestones! 🎯🎊', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES ('U05B3N05D88', 'Ravin Regmi', 'ravin@jobins.jp', '9843023667', 'J2', '', 'June 1, 2023', 'Hetauda, Makawanpur', 'B+', 'May 14, 1991', '', '57521527');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), ':tada::birthday: Happy Birthday, <@U05B3N05D88>! :birthday::tada:
 May the year ahead be full of exciting opportunities, personal growth, and unforgettable moments — all under the spirit of One JoBins. :handshake::skin-tone-2:
 Your energy, dedication, and positivity continue to inspire us every day. :balloon::star2:
Let’s make this next chapter even more amazing — together as one team, one dream. :gift::rocket:
 Have the happiest birthday ever, <@U05B3N05D88>! :partying_face::confetti_ball: You deserve nothing but the best — today and always. :sparkling_heart::raised_hands:', 'ravin-regmi.png', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations <@U05B3N05D88> on your work anniversary! 🎖️🎉

Your technical skills and positive attitude make every project better! 💻✨

Thank you for your commitment and for being such a reliable team player! 🤝🚀

Here''s to more successful projects and continued growth! 🎯🌟', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Binay Maharjan', 'binaya_m@jobins.jp', '9843599512', 'J2', '', 'July 10, 2023', 'MangalBazaar, Lalitpur', 'B+', 'October 18, 1995', '', '9843742876');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Binay Maharjan on your work anniversary! 🎖️🎉

Your technical expertise and problem-solving abilities continue to impress us all! 💻⚡

Thank you for your dedication and for being such a valuable part of our team! 🌟🚀

Wishing you continued success and many more achievements! 🎯🎊', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES ('U05HTCA245T', 'Sailesh Shrestha', 'sailesh@jobins.jp', '9849104170', 'J2', 'Frontend', 'July 20, 2023', 'Thaiba,Lalitpur', 'A+', '12/31/1992', '', '9843201170');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), ':tada: Happy Birthday, <@U05HTCA245T>! :birthday: Your skills as a front-end developer continually inspire us all. Thank you for making our user experiences smooth and stylish! Here’s to more success and innovation in the coming year. :star2: Cheers to you! :clinking_glasses:', 'sailesh-shrestha.png', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations <@U05HTCA245T> on your work anniversary! 🎖️🎉

Your frontend expertise and attention to detail create amazing user experiences! 💻🎨

Thank you for your passion and for making our applications shine! ✨🚀

Here''s to more beautiful interfaces and successful projects! 🎯🌟', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Suresh Sapkota', 'suresh@jobins.jp', '9846210550', 'J2', 'UI/UX Designer', 'October 1, 2023', 'Pulchowk, Lalitpur', 'O+', 'November 20, 1986', '', '9846907847');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Suresh Sapkota on your work anniversary! 🎖️🎉

Your creative vision and UI/UX skills bring our designs to life! 🎨💫

Thank you for your dedication and for making our products both functional and beautiful! 🌟🚀

Wishing you continued success and many more creative achievements! 🎯🎊', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES ('U070A87LG57', 'Taslima Miya', 'taslima@jobins.jp', '9866054302', 'J2', 'Senior QA Engineer', 'April 22, 2024', 'Sundar Bazar6, Lamjung', 'A+', 'August 22, 1999', '', '9805875330');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), ':tada::birthday: Happy Birthday, <@U070A87LG57>! :birthday::tada:
 May the year ahead be full of exciting opportunities, personal growth, and unforgettable moments — all under the spirit of One JoBins. :handshake::skin-tone-2:
 Your energy, dedication, and positivity continue to inspire us every day. :balloon::star2:
Let’s make this next chapter even more amazing — together as one team, one dream. :gift::rocket:
 Have the happiest birthday ever, <@U070A87LG57>! :partying_face::confetti_ball: You deserve nothing but the best — today and always. :sparkling_heart::raised_hands:', 'taslima-miya.png', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations <@U070A87LG57> on your work anniversary! 🎖️🎉

Your QA expertise and attention to detail ensure our products are always top-quality! 🔍✨

Thank you for your thoroughness and for being such a crucial part of our team! 🌟🚀

Here''s to more bug-free releases and continued excellence! 🎯💫', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Abishek Chuhan', 'abishek@jobins.jp', '9861290700', 'J1', 'UI/UX Designer', 'June 24, 2024', 'Panauti, Kavre', 'O+', 'October 3, 2000', '', '9841611911');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Abishek Chuhan on your work anniversary! 🎖️🎉

Your creative talent and fresh perspective bring new life to our designs! 🎨⚡

Thank you for your enthusiasm and for being such a valuable addition to our team! 🌟🚀

Wishing you continued growth and many more creative successes! 🎯🎊', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES ('U07L4Q2TCV6', 'Sanil Nakarmi', 'sanil@jobins.jp', '9843605549', 'J2', '', 'September 1, 2024', 'Chamati, Kathmandu', 'O+', '12/27/1993', '', '9841721731');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), ':tada::birthday: Happy Birthday, <@U07L4Q2TCV6>! :birthday::tada:
As you celebrate another year of innovation and success, we wish you continued inspiration and joy in all your endeavors. Your contributions as a Software Engineer have not only propelled our projects forward but have also set a benchmark for excellence. May this year bring you incredible opportunities and achievements. Here’s to another year of great code, breakthroughs, and professional growth!
Cheers to your best year yet! :rocket::cake:', 'sanil-nakarmi.png', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations <@U07L4Q2TCV6> on your work anniversary! 🎖️🎉

Your technical skills and collaborative spirit make you an excellent team member! 💻🤝

Thank you for your dedication and for always bringing your best to every project! 🌟🚀

Here''s to more successful collaborations and continued growth! 🎯✨', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Birendra Gurung', 'birendra@jobins.jp', '9819412342', 'J2', '', 'November 5, 2024', 'Butwal, Rupandehi', 'B+', 'February 18, 1995', '', '9867089833');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Birendra Gurung on your work anniversary! 🎖️🎉

Your technical expertise and positive attitude make every project better! 💻✨

Thank you for your commitment and for being such a reliable team player! 🤝🚀

Wishing you continued success and many more milestones! 🎯🎊', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES ('U0835M4MU83', 'Sambhav Rijal', 'sambhav@jobins.jp', '9843149865', 'J1', 'Frontend', 'December 2, 2024', 'Balkot, Bhaktapur', 'A+', '02/28/2001', '', '9849821527');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), ':tada: Happy Birthday, <@U0835M4MU83>! :birthday: Wishing you a year ahead filled with endless success, boundless happiness, and exciting new opportunities! :star2: May your special day be filled with laughter, love, and unforgettable memories! :balloon::sparkles: Here’s to an incredible celebration and a year full of remarkable achievements and adventures! :confetti_ball::gift: Enjoy every moment! :partying_face::tada:', 'sambhav-rijal.png', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations <@U0835M4MU83> on your work anniversary! 🎖️🎉

Your frontend skills and fresh perspective bring new energy to our projects! 💻⚡

Thank you for your enthusiasm and for being such a valuable addition to our team! 🌟🚀

Here''s to more growth and successful collaborations! 🎯✨', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Manoj Rai', 'manoj@jobins.jp', '9824330787', 'J1', 'Frontend', 'December 9, 2024', 'Itahari - 20, Sunsari', 'O+', 'April 13, 2000', '', '9819981439');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Manoj Rai on your work anniversary! 🎖️🎉

Your frontend expertise and attention to detail create amazing user experiences! 💻🎨

Thank you for your passion and for making our applications shine! ✨🚀

Wishing you continued success and many more beautiful interfaces! 🎯🌟', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Amir Shakya', 'amir@jobins.jp', '9745619494', 'J2', '', 'January 20, 2025', 'Mangal bazaar, Patan', 'O+', 'March 31, 1987', '', '9841598444');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Amir Shakya on your work anniversary! 🎖️🎉

Your technical skills and collaborative spirit make you an excellent team member! 💻🤝

Thank you for your dedication and for always bringing your best to every project! 🌟🚀

Here''s to more successful collaborations and continued growth! 🎯✨', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES ('U088ZBW4Z9B', 'Sudip Neupane', 'sudip@jobins.jp', '9849036338', 'J2', '', 'January 20, 2025', 'Dhapakhel 23, Lalitpur', 'AB+', 'August 28, 1988', '', '9845048630');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), ':tada::birthday: Happy Birthday, <@U088ZBW4Z9B>! :birthday::tada:
 May the year ahead be full of exciting opportunities, personal growth, and unforgettable moments — all under the spirit of One JoBins. :handshake::skin-tone-2:
 Your energy, dedication, and positivity continue to inspire us every day. :balloon::star2:
Let’s make this next chapter even more amazing — together as one team, one dream. :gift::rocket:
 Have the happiest birthday ever, <@U088ZBW4Z9B>! :partying_face::confetti_ball: You deserve nothing but the best — today and always. :sparkling_heart::raised_hands:', 'sudip-neupane.png', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations <@U088ZBW4Z9B> on your work anniversary! 🎖️🎉

Your technical expertise and problem-solving abilities continue to impress us all! 💻⚡

Thank you for your dedication and for being such a valuable part of our team! 🌟🚀

Wishing you continued success and many more achievements! 🎯🎊', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Om Prakash Sahani', 'om_sahani@jobins.jp', '9869745682', 'J2', '', 'January 20, 2025', 'Shantinagar, New Baneshwor', 'B+', 'February 17, 1993', '', '9825284654');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Om Prakash Sahani on your work anniversary! 🎖️🎉

Your technical skills and positive attitude make every project better! 💻✨

Thank you for your commitment and for being such a reliable team player! 🤝🚀

Here''s to more successful projects and continued growth! 🎯🌟', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES ('U08BSJW2J65', 'Nadika Poudel', 'nadika@jobins.jp', '9840044672', 'J1', '', 'February 3, 2025', 'Lolang, Tarkeshwor-5, Kathmandu', 'B+', '02/25/2001', '', '9841371504');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), ':tada: Happy Birthday, <@U08BSJW2J65>! :birthday: Wishing you a fantastic year ahead filled with success, happiness, and new opportunities. May this special day bring you joy, laughter, and wonderful memories to cherish. Hope you have an amazing celebration and a year full of achievements! :balloon::sparkles::partying_face:', 'nadika-poudel.jpg', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations <@U08BSJW2J65> on your work anniversary! 🎖️🎉

Your fresh perspective and technical skills bring new energy to our projects! ⚡💻

Thank you for your enthusiasm and for being such a valuable addition to our team! 🌟🚀

Wishing you continued growth and successful collaborations! 🎯✨', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Ukesh Gaiju', 'ukesh@jobins.jp', '9860465606', 'J3', '', 'February 17, 2025', 'Dekocha 6, Bhaktapur', 'O+', 'April 15, 1992', '', '9841070585');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Ukesh Gaiju on your work anniversary! 🎖️🎉

Your technical expertise and collaborative spirit make you an invaluable team member! 💻🤝

Thank you for your dedication and for always bringing your best to every project! 🌟🚀

Here''s to more successful collaborations and continued growth! 🎯🎊', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES ('U08E4T3NJF8', 'Prabin Maharjan', 'prabin@jobins.jp', '9849682276', 'J2', '', 'February 21, 2025', 'kirtipur 01,kathmandu', 'B+', '04/22/1994', '', '9818864770');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), ':tada::birthday: Happy Birthday, <@U08E4T3NJF8>! :birthday::tada:
 Wishing you a year ahead filled with limitless success, joy, and endless new adventures! :star2: May your day be as incredible as you are — filled with love, laughter, and moments that become unforgettable memories. :balloon::dizzy:
 Here’s to an exciting journey of growth, accomplishments, and all the dreams your heart is set on! :gift::rocket:
 Embrace every moment today — you deserve the absolute best, not just today, but every day! :partying_face::confetti_ball: Let’s make this year your most amazing one yet! :stars::sparkling_heart:', 'prabin-maharjan.png', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations <@U08E4T3NJF8> on your work anniversary! 🎖️🎉

Your technical skills and positive attitude make every project better! 💻✨

Thank you for your commitment and for being such a reliable team player! 🤝🚀

Wishing you continued success and many more milestones! 🎯🌟', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Prabal Pradhan', 'prabal@jobins.jp', '9860395442', 'J3', '', 'March 3, 2025', 'Patan', 'A+', 'April 12, 1991', '', '9841789889 (mother)');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Prabal Pradhan on your work anniversary! 🎖️🎉

Your technical expertise and problem-solving abilities continue to impress us all! 💻⚡

Thank you for your dedication and for being such a valuable part of our team! 🌟🚀

Here''s to more successful projects and continued growth! 🎯🎊', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Kiran Maiya Prajapati', 'kiran@jobins.jp', '9843815002', 'J3', '', 'March 3, 2025', 'Katunje, bhaktapur', 'B+', 'October 1, 1995', '', '9849894901');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Kiran Maiya Prajapati on your work anniversary! 🎖️🎉

Your technical skills and collaborative spirit make you an excellent team member! 💻🤝

Thank you for your dedication and for always bringing your best to every project! 🌟🚀

Wishing you continued success and many more achievements! 🎯✨', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Roshan Raman Giri', 'roshan@jobins.jp', '9841324169', 'J2', '', 'March 3, 2025', 'Thashikhel, Lalitpur', 'O+', 'August 12, 2001', '', '9825690059');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Roshan Raman Giri on your work anniversary! 🎖️🎉

Your fresh perspective and technical skills bring new energy to our projects! ⚡💻

Thank you for your enthusiasm and for being such a valuable addition to our team! 🌟🚀

Here''s to more growth and successful collaborations! 🎯🎊', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Bikash Bhandari', 'bikash@jobins.jp', '9841341276', 'Consultant', '', 'June 16, 2025', 'SrijanaNagar, Bhaktapur', 'O+', 'February 9, 1986', '', '9841436457');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Bikash Bhandari on your work anniversary! 🎖️🎉

Your consulting expertise and strategic insights continue to guide our success! 💼🎯

Thank you for your wisdom and for being such a valuable advisor to our team! 🌟🚀

Wishing you continued success and many more strategic wins! 🎊✨', '', '', '2025-08-29T04:28:57.668Z');

INSERT INTO profiles (user_id, name, email, mobile, position, designation, join_date, address, blood_group, dob, image, secondary_contact) VALUES (NULL, 'Neha Karn', 'neha@jobins.jp', '9862170501', '', 'QA Engineer', 'August 18, 2025', 'Biratnagar-7, Morang, Nepal', '', '', '', '9862170501');
INSERT INTO birthday_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '', '', '', '2025-08-28T13:22:26.103Z');
INSERT INTO anniversary_configs (profile_id, message, image, last_celebrated_date, added_at) VALUES (last_insert_rowid(), '🎉🎖️ Congratulations Neha Karn on your work anniversary! 🎖️🎉

Your QA expertise and attention to detail ensure our products are always top-quality! 🔍✨

Thank you for your thoroughness and for being such a crucial part of our team! 🌟🚀

Here''s to more bug-free releases and continued excellence! 🎯💫', '', '', '2025-08-29T04:28:57.668Z');

