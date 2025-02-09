# TESTING

## Process Overview

![alt text](/ng-kit/assets/guides/images/supervising-unit-tests.png "Supervising Unit Tests")

## Unit Test Guidelines
Unit tests are used to verify correctness of implementations and are run as part of every full build. Unit tests are short, quick, and automated tests that make sure a specific part of your program works. They test specific functionality of a method or class that have a clear pass/fail condition. By writing unit tests, developers can make sure their code works, before passing it to QA for further testing.

## Coverage
We are aiming to have our code coverage above 90%. It is reasonable target that can be reached on the project. Ideally your code need to be covered by 100% but if you covered 90% already and last 10% will take same time as previous 90% - you are better not to waste time. This do not applies to sensitive parts as payments processing or authorization. These need to be fully covered. If you are not sure about last percents of coverage - consult with your lead.



## Units and packages
Unit is a function, package is a class. If your code is organized correctly and there is no long methods and classes doing different functionality it will be very easy for you to organize your tests.



## Where and when to write tests
New code need to be written same time with code changes. No delays are accepted. You cannot write code now and cover it with tests later. This is ensured by hooks and reviews.

If existing code is changed - coverage percentage need to stay same or increase after your change.

If after your code change test has failed - your responsibility is to fix that test. If you don’t have enough expertise, this need to be solved with help of leads. Failed tests are not accepted at any condition.

We have a step 'AutoTests' which is mandatory, if at least one test failed then ticket in Jira is automatically reopened and developer has to check his code

## How to Write Good Tests
Unit tests should be as short, fast, and reliable as they can be.  Every developer on the project will be running your tests, they should be easy to run and produce accurate results. Here are some key ways to write tests that are not brittle:

- Avoid using sleep() whenever possible, since it often leads to brittle tests.  If you find that you have to wait for an event or wait for some work to be done by another thread, prefer latches or thread notifications to sleeps.
- Try to keep individual tests small, and only test one thing per test.
- Use test doubles (mocks, stubs, dummies) when you need to include a complicated service to satisfy dependencies.
- Your tests may run simultaneously. If you use static variables in classes, be sure to reset them to known starting values before each test runs.
- Do not use local resources like files, ports, or IP Addresses in tests.


## Unit tests review
Test Reviews (like code reviews, but on tests) can offer you the best process for teaching and improving the quality of your code and your unit tests while implementing unit testing into your organization. Review EVERY piece of unit testing code, and use the following points as a simple checklist of things to watch out for.

Please note: unit tests are reviewed by same reviewer who is reviewing code itself. Unit tests are reviewed same time.

![alt text](/ng-kit/assets/guides/images/supervising-unit.png "Supervising Unit")

### Readability
- Make sure setup and teardown methods are not abused. It’s better to use factory methods for readability.
- Make sure the test tests one thing only.
- Check for good and consistent naming conventions.
- Make sure that only meaningful assert messages are used, or none at all (meaningful test names are better).
- Make sure asserts are separated from actions (different lines).
- Make sure tests don’t use magic strings and values as inputs. use the simplest inputs possible to prove your point.
- Make sure there is consistency in location of tests. make it easy to find related tests for a method, or a class, or a project.

### Maintainability
- Make sure tests are isolated from each other and repeatable.
- Make sure that testing private or protected methods is not the norm (public is always better).
- Make sure tests are not over-specified.
- Make sure that state-based testing is preferred over using interaction testing.
- Make sure strict mocks are used as little as possible (leads to over specification and fragile tests).
- Make sure there is no more than one mock per test.
- Make sure tests do not mix mocks and regular asserts in the same test (testing multiple things).
- Make sure that tests ‘verify’ mock calls only on the single mock object in the test, and not on all the fake objects in the tests (the rest are stubs, this leads to over specification and fragile tests).
- Make sure the test verifies only on a single call to a mock object. Verifying multiple calls on a mock object is either over specification or testing multiple things.
- Make sure that only in very rare cases a mock is also used as a stub to return a value in the same test.

### Trust
- Make sure the test does not contain logic or dynamic values.
- Check coverage by playing with values (booleans or consts).
- Make sure unit tests are separated from integration tests.
- Make sure tests don’t use things that keep changing in a unit test (like DateTime.Now ). Use fixed values.
- Make sure tests don’t assert with expected values that are created dynamically - you might be repeating production code.

## PHP
In php we are using PHPUnit with mockery.

Version - 6.5.7
Use following command to run unit tests - ./bin/phpunit -c app/unit_tests.xml.para (or this command to run tests in parallel ./bin/paratest -c app/unit_tests.xml.para --phpunit ./bin/phpunit --runner WrapRunner -p 4)

Use following command to run functional tests - ./bin/phpunit -c app/functional_tests.xml.para (or this to run tests in parallel ./bin/paratest -c app/functional_tests.xml.para --phpunit ./bin/phpunit --runner WrapRunner -p 4)

To generate code coverage report just add this param to any command  --coverage-text

Example of success run: https://ci.devpayever.com/admin/devops/admin/testtask/26309/show

Example of failed run: https://ci.devpayever.com/admin/devops/admin/testtask/26285/show

## Javascript
In javascript we are using karma with jasmine.

karma version 2.0.

karma-jasmine version 1.1.

For running test we use npm run test command. Tests are run in CI when task is completed.

Example of success run: https://ci.devpayever.com/admin/devops/admin/testtask/26240/show

Example of failed run: https://ci.devpayever.com/admin/devops/admin/testtask/26238/show

Coverage reports available in logs.

For more details check Frontend testing guide

## Resources
- The art of unit testing http://artofunittesting.com. Ultimate resource for unit tests.
- Laravel Testing Decoded. Jeffrey Way. http://leanpub.com/laravel-testing-decoded. Good and easy book about testing in MVC structure. Laravel is used as an example but it is worth a read for any MVC framework
- Official symfony documentation for php developers. https://symfony.com/doc/current/best_practices/tests.html
- Official angular documentation for javascript developers https://angular.io/guide/testing
- Good article on unit testing concepts. Worth a read https://martinfowler.com/articles/mocksArentStubs.html
