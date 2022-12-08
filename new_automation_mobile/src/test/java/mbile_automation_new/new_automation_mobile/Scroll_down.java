package mbile_automation_new.new_automation_mobile;

import org.openqa.selenium.JavascriptExecutor;
import org.testng.annotations.Test;

import com.google.common.collect.ImmutableMap;

import io.appium.java_client.AppiumBy;

public class Scroll_down extends Base
{
   @Test
	public void testcase3() 
	{

	   driver.findElement(AppiumBy.accessibilityId("Views")).click();
		//This scrolls infinitely  if wants downward then direction has to be "down" else "up" for upward. 
		boolean canScrollMore;
		do {
		 canScrollMore = (Boolean) ((JavascriptExecutor) driver).executeScript("mobile: scrollGesture", 
				 ImmutableMap.builder()
		            .put("left", 100)
		            .put("top", 100)
		            .put("width", 200)
		            .put("height", 200)
		            .put("direction", "down")
		            .put("percent", 3.0)
		            .build()
					);
						
						    
	
		}while(canScrollMore);
		
					
			

	   
	
	}
}
