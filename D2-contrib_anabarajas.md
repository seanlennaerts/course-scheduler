Final test pass rate: 100%
Final code coverage rate: 100%

https://github.com/CS310-2016Fall/cpsc310project_team2/commit/7dfceb29e204802d69536f9afb5be7efebe8b503

In order to fix isValid() for d2, I implemented helper functions to handle cases where ORDER was an object instead of a string. In this commit I also added most of the tests needed to tests for the new specifications of d2.

https://github.com/CS310-2016Fall/cpsc310project_team2/commit/edd99b10a5aa5a300e757753d63ba31996e48842
In this commit I implemented handlers for then optional query keys APPLY and ORDER, and integrated with isValid for d2 and d1, to handle all cases. 