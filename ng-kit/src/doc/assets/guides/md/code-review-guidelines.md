# Code review guidelines

## Process
After you finish your task in jira you need to create pull request in git and assign it to appropriate reviewer. If task has sensitive changes or is
complex enough - team lead need to participate in code review. Otherwise peer review is enough (assign to some senior dev from your team).

## Checklist
Make sure these points are checked before submitting/approving the PR.

## General
- The code works.
- The code is easy to understand.
- Follows coding conventions
- Names are simple and if possible short. Please note ‘if possible’. It is better to have long but descriptive identificator, than short one.
- Names are spelt correctly.
- Names contain units where applicable.
- There are no usages of magic numbers.
- No hard coded constants that could possibly change in the future.
- All variables are in the smallest scope possible.
- There is no commented out code.
- There is no dead code (inaccessible at Runtime).
- No code that can be replaced with library functions.
- Variables are not accidentally used with null values.
- Variables are immutable where possible.
- Code is not repeated or duplicated.
- There is an “else” block for every “if” clause even if it is empty.
- No complex/long boolean expressions.
- No negatively named boolean variables.
- No empty blocks of code.
- Ideal data structures are used.
- Constructors do not accept null/none values.
- Catch clauses are fine grained and catch specific exceptions.
- Exceptions are not eaten if caught, unless explicitly documented otherwise.
- Files/Sockets and other resources are properly closed even when an exception occurs in using them.
- null is not returned from any method.
- == operator and === (and its inverse !==) are not mixed up.
- Floating point numbers are not compared for equality.
- Loops have a set length and correct termination conditions.
- Blocks of code inside loops are as small as possible.
- No methods with boolean parameters.
- No object exists longer than necessary.
- No memory leaks.
- Code is unit testable.
- Test cases are written wherever possible (please refer unit tests guidelines for more info).
- Methods return early without compromising code readability.
- Performance is considered.
- Loop iteration and off by one are taken care of.

## Architecture

- Design patterns if used are correctly applied.
- Law of Demeter is not violated.
- A class should have only a single responsibility (i.e. only one potential change in the software's specification should be able to affect the
- specification of the class).
- Classes, modules, functions, etc. should be open for extension, but closed for modification.
- Objects in a program should be replaceable with instances of their subtypes without altering the correctness of that program.
- Many client-specific interfaces are better than one general-purpose interface.
- Depend upon Abstractions. Do not depend upon concretions.

### Logging

- Logging should be easily discoverable.
- Required logs are present.
- Frivolous logs are absent.
- Debugging code is absent.
- No stack traces are printed.

### Documentation

- Comments should indicate WHY rather that WHAT the code is doing.
- All methods are commented in clear language.
- Comments exist and describe rationale or reasons for decisions in code.
- All public methods/interfaces/contracts are commented describing usage.
- All edge cases are described in comments.
- All unusual behaviour or edge case handling is commented.
- Data structures and units of measurement are explained.

### Security

- All data inputs are checked (for the correct type, length/size, format, and range).
- Invalid parameter values handled such that exceptions are not thrown.
- No sensitive information is logged or visible in a stack trace.

## PHP specific guidelines

As coding standards we are using symfony’s standards.

### Checklist

- No print_r, var_dump or similar calls exist.

#### API

- APIs and other public contracts check input values and fail fast.
- API checks for correct oauth scope / user permissions.
- Any API change should be reflected in the API documentation.
- APIs return correct status codes in responses.PHPDoc

#### PHPDoc

1. It is necessary to use only if it is unique data.
2. Do not duplicate data with type specification in the definition of methods
3. Please avoid redundant comments. (e.g. comments, which duplicate method name)
```
/**
 * Gets Name
 *
 * @return string
 */
 public function getName(): ?string
 {
     return $this->name;
 }
```
4. @apiDoc block is still required for REST API endpoints (NelmioApiDoc)

#### Types of function arguments
1. All function arguments must be type hinted if it is possible.
```
 public function removeByUuid(?string $uuid, \DateTimeInterface
$removeDate): void
```

#### Return types

1. All functions must have a return type declared if is it possible. If function returns void, 'void' return type must be fined.
```
public function createOrUpdateByDto(BusinessUpdateDto $dto): void
```

#### Strict mode

1. All php scripts must be declared as a strict.
```
<?php declare(strict_types=1);
```

#### Security checks
- Follow Symfony "Best Practicies" for security: https://symfony.com/doc/3.4/best_practices/security.html
- Check every entity you are working with has strict access control, use "Voters" to check access
- Every model or entity should be strictly validated by business rules. Strict validation also protects against "Buffer overflow" attacks.
- The data that user inputs should be sanitized
- SQL injections (or LDAP Injections) are automaticaly protected by Doctrine ORM, but should be extra checked in specific cases if raw queries are performed
- XSS attacks are automatically protected by Twig teplating engine but should be extra checked in case raw data is needed
- Check that secure information is not leaked with error messages
- Check that CSRF token is enabled when dealing with forms
- Check that OS commands are not executed at all to prevent "OS Command Injection"
- Sensitive data should not be logged

#### Database format and migrations.

- All database changes should be done first in entities and then copied to migrations by using command bin/console
doctrine:migrations:diff
- Regarding UUIDs.
- They should be of type CHAR(36) NOT NULL.
- Index lookups on CHAR are on average 20% faster than VARCHAR (https://goo.gl/sQfZN1) - and usually UUIDs are used as primary indexes.

## Javascript specific guidelines
https://payever.atlassian.net/wiki/spaces/PROD/pages/11829287/How+to+prepare+frontend+code+for+review


