package mbile_automation_new.new_automation_mobile;

import org.testng.annotations.Test;

import io.appium.java_client.AppiumBy;

public class scrolling_down_uiautomate extends Base

{
	@Test
	public void testcase4() 
	{
		driver.findElement(AppiumBy.accessibilityId("Views")).click();
		driver.findElement(AppiumBy.androidUIAutomator("new UiScrollable(new UiSelector()).scrollIntoView(text(\"WebView\"));"));
	}

}
