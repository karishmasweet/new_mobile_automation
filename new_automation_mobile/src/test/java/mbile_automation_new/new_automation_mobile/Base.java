package mbile_automation_new.new_automation_mobile;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;

import org.testng.annotations.BeforeMethod;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;
import io.appium.java_client.remote.MobileCapabilityType;
import io.appium.java_client.remote.MobilePlatform;
import io.appium.java_client.service.local.AppiumDriverLocalService;
import io.appium.java_client.service.local.AppiumServiceBuilder;
import io.appium.java_client.service.local.flags.GeneralServerFlag;

public class Base 
{
	public AndroidDriver driver;
	@BeforeMethod
	public void init() throws MalformedURLException
	{
		File app= new File("../new_automation_mobile/ApiDemo.apk");
		File js = new File("../new_automation_mobile/appium/build/lib/main.js"); 

		
		AppiumDriverLocalService
		service = 
	    		new AppiumServiceBuilder()	    
	    		.withAppiumJS(js)
	    		.withIPAddress("0.0.0.0")
	    	    .withArgument(GeneralServerFlag.BASEPATH, "wd/hub")
	    		.usingPort(4723)
	    		.build();
	    service.start();
        UiAutomator2Options op = new UiAutomator2Options();
		op.setCapability(MobileCapabilityType.PLATFORM_NAME, MobilePlatform.ANDROID);
		op.setCapability(MobileCapabilityType.DEVICE_NAME, "cfd046d8");
		op.setCapability(MobileCapabilityType.APP, app.getAbsolutePath());
	     driver=new AndroidDriver(new URL("http://0.0.0.0:4723/wd/hub"),op);
	}
}
