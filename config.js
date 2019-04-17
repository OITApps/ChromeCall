/**
 * Hello and Welcome to ChromeCall.
 *
 * *****INSTALLATION INSTRUCTIONS*****
 * 1) Input Company Information
 *      At the bottom of this form you'll see various lines of text in the form of [ name = 'text' ]
 *      For each of these fields replace the text in quotation with information about your company.
 * 2) Update Company Logos.
 *      In the extension files you will find a folder named "img".
 *      In this folder there are 2 files which need to be replaced.
 *          icon        (to be displayed as the extension icon and in the title bar of the extension options)
 *          banner      (to be displayed prominently on the extension login and home page)
 *      You will need to replace each of these files with a PNG file with the same dimensions.
 *          icon: 16 x 16 pixels.
 *          banner: 256 x 64 pixels.
 *      The background of your logo should either be transparent or white.
 * 3) Install the extension.
 *      Once you have done steps 1 and 2, you're ready to install the extension.
 *      Enter the following into your Google Chrome Address Bar:
 *          chrome://extensions/
 *      In the top right of the page, you should see a switch to turn on "Developer mode."
 *      Turn Developer Mode on.
 *      In the top left opposite the Developer Mode switch click the "Load Unpacked Button."
 *      Navigate to where you have the extension saved.
 *      You should be inside the extension folder before you press "Select Folder" on the bottom right.
 * 4) Log In
 *      If the extension was installed successfully, it should be visible on the chrome://extensions/ page.
 *      On the top right of your browser the extension with your logo should appear.
 *      If you do not see it, click the hamburger menu (Three vertical dots) and it should be there.
 *      Clicking that icon with your logo will bring up the menu.
 *      Now enter your credentials.
 * 5) Check if your company information and images were successfully added.
 *      You can navigate through the extension using the hamburger menu on the top right. (three vertical dots)
 *      Navigate to the options and about page to see if your company information is displayed accurately.
 *      Check the title bar at the top of the options to see if your logo and the extension name are displayed correctly.
 * 6) Test the Extension.
 *      Once you have logged in, the extension should be up and running.
 *      Simply visit a page with phone numbers and mouse over them to see the call tooltip popup.
 *      Clicking on the Tooltip will initiate a call.
 *      Clicking the edit icon will allow you to edit the number or make dial a different number.
 *          (See help tab for more information.)
 *
 *
 */




url = 'https://manage.oitvoip.com/ns-api/';
clientID = '20463.client';
clientSecret = '18c038c8676d9d4114390ab4a5862d8b';

company_name = "OITVOIP";
company_email = "support@oitvoip.com";
company_phonenumber = "844.OIT.VOIP";
company_website = "support@oitvoip.com";
company_website_display_name = "https://www.oitvoip.com";
company_support_website = "mailto:support@oitvoip.com?subject=Chromecall";
company_support_website_display_name = "Need Help?";
extension_name = "ChromeCall";
extension_initials = "CC";









