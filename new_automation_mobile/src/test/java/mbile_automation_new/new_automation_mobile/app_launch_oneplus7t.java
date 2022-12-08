package mbile_automation_new.new_automation_mobile;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.annotations.Test;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;
import io.appium.java_client.pagefactory.bys.builder.AppiumByBuilder;
import io.appium.java_client.remote.MobileCapabilityType;
import io.appium.java_client.remote.MobilePlatform;
import io.appium.java_client.service.local.AppiumDriverLocalService;
import io.appium.java_client.service.local.AppiumServiceBuilder;
import io.appium.java_client.service.local.flags.GeneralServerFlag;

public class app_launch_oneplus7t extends Base
{
	@Test
	public void Testase1()throws MalformedURLException, InterruptedException
	{

//		
//		File app= new File("../new_automation_mobile/ApiDemo.apk");
//		File js = new File("../new_automation_mobile/appium/build/lib/main.js"); 
////		AppiumDriverLocalService service= new AppiumServiceBuilder()
////				.withAppiumJS(js).withIPAddress("127.0.0.1").withArgument(GeneralServerFlag.BASEPATH, "wd/hub").usingPort(4723).build();
////		service.start();
//		
//		AppiumDriverLocalService
//		service = 
//	    		new AppiumServiceBuilder()	    
//	    		.withAppiumJS(js)
//	    		.withIPAddress("0.0.0.0")
//	    	    .withArgument(GeneralServerFlag.BASEPATH, "wd/hub")
//	    		.usingPort(4723)
//	    		.build();
//	    service.start();
//UiAutomator2Options op = new UiAutomator2Options();
//		op.setCapability(MobileCapabilityType.PLATFORM_NAME, MobilePlatform.ANDROID);
//		op.setCapability(MobileCapabilityType.DEVICE_NAME, "cfd046d8");
//		op.setCapability(MobileCapabilityType.APP, app.getAbsolutePath());
//		
//		
//		
//		
//		
//		
//		
//		
//		
//		
//		
//			
////			DesiredCapabilities capabilities=new DesiredCapabilities();
////			capabilities.setCapability("device","Android");
////			capabilities.setCapability(CapabilityType.BROWSER_NAME,"");
////			capabilities.setCapability(CapabilityType.VERSION,"11");
////			capabilities.setCapability("app",app.getAbsolutePath());
////			capabilities.setCapability("device name","cfd046d8");
////			capabilities.setCapability("plateform","Android");
////			capabilities.setCapability("noRest","False");
////			AppiumDriverLocalService service= new AppiumServiceBuilder().withAppiumJS(new File("../usr/local/lib/node_modules/appium/build/lib/main.js")).withIPAddress("0.0.0.0").usingPort(4723)
////					.build();
////					
////					service.start();
//			AndroidDriver driver=new AndroidDriver(new URL("http://0.0.0.0:4723/wd/hub"),op);
//			
			WebElement preference=driver.findElement(By.xpath("//android.widget.TextView[@content-desc=\"Preference\"]"));
			preference.click();
			
			Thread.sleep(5000);
			
			WebElement preference_dependency =driver.findElement(By.xpath("//android.widget.TextView[@content-desc=\"3. Preference dependencies\"]"));
			preference_dependency.click();
			
			Thread.sleep(5000);
			WebElement wifi =driver.findElement(By.id("android:id/checkbox"));
			wifi.click();
			
			Thread.sleep(5000);
			WebElement wifi_setting =driver.findElement(By.xpath("(//android.widget.RelativeLayout)[2]"));
			wifi_setting.click();
			
			Thread.sleep(5000);
			driver.findElement(By.id("android:id/edit")).sendKeys("deep@nshu97"); 
			driver.findElements(By.className("android.widget.Button")).get(1).click(); 
			
	
	}


}
