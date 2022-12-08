package mbile_automation_new.new_automation_mobile;

import java.net.MalformedURLException;

import org.openqa.selenium.By;
import org.openqa.selenium.DeviceRotation;
import org.testng.annotations.Test;

import io.appium.java_client.AppiumBy;

public class Landscape extends Base
{

	@Test
	public void testcase5() throws MalformedURLException, InterruptedException
	{

        driver.findElement(AppiumBy.accessibilityId("Preference")).click();
        driver.findElement(AppiumBy.accessibilityId("3. Preference dependencies")).click();
        
        driver.findElement(By.id("android:id/checkbox")).click();
        //code below rotation
        DeviceRotation landscape= new DeviceRotation(0, 0, 90);
        driver.rotate(landscape);
        
        
	}
}
