/**
 * Hello and Welcome to ChromeCall.
 * Copyright 2019 Orsini IT, LLC
 * apps@oitvoip.com | 844.OIT.VOIP
 * Do not modify or redistribute without explicit permission from Orsini IT, LLC
 *
 * Below are the instructions for rebranding and installation. If you need support please feel free to contact us.
 * support@oitvoip.com | 844.OIT.VOIP
 *
 * === REBRANDING INSTRUCTIONS ===
 * You will need various images to be saved in the /img folder. Create the following:
 *
 * --- Icons ---
 * 16.png   - 16x16 pixels. Should be transparent background. Will be used as favicon for the extension's pages
 * 48.png   - 48x48 pixels. Should be transparent background. Will be displayed in the extension management page
 * 128.png  - 128x128 pixels. Should be transparent background. Will be displayed during the installation and in the Chrome Web Store.
 *
 * --- Extension Name ---
 * In the extension's root directory, there is a file named manifest.json. At the top of the page the following text should appear:
 *      "name": "ChromeCall",
 * Replace the text inside the parentheses for "ChromeCall" to your company name or the name you want to give this extension.
 *
 * --- Banner ---
 * banner.png - 256x64 pixels. Should be transparent or white background. Will be displayed on login and about page.
 *
 * --- Text ---
 * At the bottom of this page you will find several variables usged to display text in the application. They will be in the form of name = 'text'
 * For each of these fields replace the text in the quotation with the information you wish to be displayed
 *
 * === CONFIGURATION ===
 * You will need 3 sets of keys from OIT to make the application functional. They are:
 * - Client ID
 * - Client Secret
 * - License Key
 *
 * Please reach out to support@oitvoip.com with the subject "ChromeCall License Keys" and your reseller ID. Once you have received this information please scroll to the bottom of this page. There you will find a series of variables in the format variableName = "value"
 * Replace each of the values with your information. Be careful to not change the variable names or remove the quotation marks
 *
 * === INSTALLATION INSTRUCTIONS ===
 *      Enter the following into your Google Chrome Address Bar:
 *          chrome://extensions/
 *      In the top right of the page, you should see a switch to turn on "Developer mode."
 *      Turn Developer Mode on.
 *      In the top left opposite the Developer Mode switch click the "Load Unpacked Button."
 *      Navigate to where you have the extension saved.
 *      You should be inside the extension folder before you press "Select Folder" on the bottom right.
 *
 * === LOG IN AND TEST===
 *      If the extension was installed successfully, it should be visible on the chrome://extensions/ page.
 *      On the top right of your browser, the extension with your logo should appear.
 *      If you do not see it, click the hamburger menu (Three vertical dots) and it should be there.
 *      Clicking that icon with your logo will bring up the menu.
 *      Now enter your credentials.
 *
 *      Check if your company information and images were successfully added.
 *      You can navigate through the extension using the hamburger menu on the top right. (three vertical dots)
 *      Navigate to the options and about page to see if your company information is displayed accurately.
 *      Check the title bar at the top of the options to see if your logo and the extension name are displayed correctly.
 *
 *      Test the Extension.
 *      Once you have logged in, the extension should be up and running.
 *      Simply visit a page with phone numbers and mouse over them to see the call tooltip popup.
 *      Clicking on the Tooltip will initiate a call.
 *      Clicking the edit icon will allow you to edit the number or make dial a different number.
 *          (See help tab for more information.)
 */

managerPortal = 'https://manage.oitvoip.com'; // Manager portal URL. Example: https://manage.oitvoip.com
apiUrl = 'https://manage.oitvoip.com';  // API url of your NS servers. Typically same as your Manager Portal. Example: https://manage.oitvoip.com/ns-api/
clientID = ''; // Client ID provided by your service provider
clientSecret = ''; //Client secret provided by your service provider
licenseKey = ''; // Extension license provided by your service provider

/* Branding Configuration */
extension_name = "ChromeCall";
extension_initials = "CC";
company_name = "OITVOIP"; // Not currently displayed
company_phonenumber = "844.OIT.VOIP"; // Text displayed after Phone: on about page. Example: 844.OIT.VOIP
company_email = "support@oitvoip.com"; // Text displayed after Email: on about page. Example: support@oitvoip.com
company_website_display_name = "https://www.oitvoip.com"; // Text displayed on about page. Can be same as company_website. Example: https://www.mysite.com
company_website_link = "https://www.oitvoip.com"; // Actual URL target when the below text is clicked. Example: https://www.mysite.com
company_additional_website_display_name = "Check out our documentation"; // This is the third line in the about page. Can be used for a support offer or any other text. Example: Need Help?
company_additional_website_link = "https://docs.orsiniit.com/display/oitvoip"; // This is the link for the third line in the about page. Can be used for a support portal or any other link. Example: https://docs.orsiniit.com/display/oitvoip
voicemail_extension = "5001";