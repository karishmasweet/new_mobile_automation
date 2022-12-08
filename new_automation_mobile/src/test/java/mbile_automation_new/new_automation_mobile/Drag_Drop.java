package mbile_automation_new.new_automation_mobile;

import java.net.MalformedURLException;

import org.openqa.selenium.By;
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.remote.RemoteWebElement;
import org.testng.annotations.Test;

import com.google.common.collect.ImmutableMap;

import io.appium.java_client.AppiumBy;
import junit.framework.Assert;

public class Drag_Drop extends Base

{
	@Test
	public void testcase5() throws MalformedURLException, InterruptedException
	{	
		driver.findElement(AppiumBy.accessibilityId("Views")).click();
        driver.findElement(AppiumBy.accessibilityId("Drag and Drop")).click();
        WebElement source=driver.findElement(By.id("io.appium.android.apis:id/drag_dot_1"));
        
        
   
        ((JavascriptExecutor) driver).executeScript("mobile: dragGesture", ImmutableMap.of(
            "elementId", ((RemoteWebElement) source).getId(),
            "endX", 664,
            "endY", 600
        ));
        Thread.sleep(3000);
			
			
	
	}

}
