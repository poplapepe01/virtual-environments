package test;
 
import org.junit.Before;
import org.junit.Test;
 
import junit.framework.TestCase;
 
public class ExampleTest extends TestCase {
    @Before
    public void setUp() throws Exception {
        super.setUp();
        System.out.println("Set Up Complete.");
    }
 
    @Test
    public void testMethod(){
        System.out.println("Sample test Successful");
    }
}