package mbile_automation_new.new_automation_mobile;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.RemoteWebElement;
import org.testng.annotations.Test;

import com.google.common.collect.ImmutableMap;

import io.appium.java_client.AppiumBy;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;
import io.appium.java_client.remote.MobileCapabilityType;
import io.appium.java_client.remote.MobilePlatform;
import io.appium.java_client.service.local.AppiumDriverLocalService;
import io.appium.java_client.service.local.AppiumServiceBuilder;
import io.appium.java_client.service.local.flags.GeneralServerFlag;
import junit.framework.Assert;

public class long_click extends Base

{
	@Test
	public void testcase2() throws MalformedURLException, InterruptedException
	{	
		driver.findElement(AppiumBy.accessibilityId("Views")).click();
        driver.findElement(By.xpath("//android.widget.TextView[@content-desc='Expandable Lists']")).click();
        driver.findElement(AppiumBy.accessibilityId("1. Custom Adapter")).click();
	   WebElement element=driver.findElement(By.xpath("//android.widget.TextView[@text='People Names']"));
	 //code below of long click
	   ((JavascriptExecutor)driver).executeScript("mobile: longClickGesture",ImmutableMap.of("elementId",((RemoteWebElement)element).getId(),"duration",2000));
	  Thread.sleep(3000);
	  
	  // code below of asseration
	  String text=driver.findElement(By.id("android:id/title")).getText();
	  Assert.assertEquals(text,"Sample menu");
	  Assert.assertTrue(driver.findElement(By.id("android:id/title")).isDisplayed());
			
			
	
	}



}
