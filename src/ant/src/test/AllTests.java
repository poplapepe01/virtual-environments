package test;
 
import junit.framework.Test;
import junit.framework.TestSuite;
 
public class AllTests {
 
    public static Test suite() {
        TestSuite suite = new TestSuite("Test for test");
        suite.addTestSuite(ExampleTest.class);
        return suite;
    }
 
}