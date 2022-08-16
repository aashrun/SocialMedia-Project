Social Media Project’s README

Along with a few complex logics been put into this project, we have tried to incorporate AWS S3 services along with Cache (Redis precisely) which has made the experience of this project surreal! This project consists of 21 APIs and is a thorough backend handle of a social media platform famously known as “Instagram”. Hope you enjoy reading this README and benefit from it! 😊



1)	POST API – Creating a profile.
A profile is created on the Social Media platform whilst handling many validations like ‘age should be more than 13’, the username should be unique etc. Some fields have not been kept mandatory, like the profile image, bio and location. A user is then successfully able to create a profile on the social media platform.



2)	POST API – Logging in the User.
In this API, we have handled two scenarios in total – first being that a user can log in with their mobile number and password and the second being that a user can log in with their email and password. Strict validations have been used for email format and on mobile number (to check if the mobile number is an Indian mobile number or not). We have installed a package called “JWT” which is being sent in the response body for the authentication and the authorization purposes.



3)	GET API – Fetching profile details of a user.
This API was designed keeping in mind about two different scenarios – first being that a user wants to fetch details of their own profile and the second being that a user wants to fetch details of somebody else’s profile. When trying to fetch details of own profile, the API has been built in a very simple manner keeping in mind about what details have to be shown in the response body, for example, the full name, username, post count, followers count, following count, profile image, bio and the post data ONLY. The second scenario is when the user tries to fetch the details of somebody else’s profile by providing their profileId in the request body. The extra validation which goes into the picture is that it was imperative to check if the other user had blocked us or not. If yes, then an error will be shown in the response body with a status code of 403 (Forbidden). Cache was implemented in this API for a better yet faster experience which in turn helps reduce the number of DB calls.



4)	PUT API – Updating a profile.
This API is a lot similar to the create profile API but the response structure was kept different this time. A user gets enough flexibility to update almost all their details but the response only showed the full name, username, post count, followers count, following count, profile image, bio and the post data ONLY (keeping Instagram’s interface in mind). Implemented cache here as well, setting updated details.



5)	DELETE API – Deleting a profile.
This was one of the most complex APIs in the project. We had to handle a lot of edge cases and surely, it wasn’t just a soft delete. The one who deletes their profile had their post count go to 0 along with their follower’s and following’s count as well. The post data was emptied, the followers and the following were removed from the other people’s following list and follower list who had followed or followed by the person who deleted their profile, and their follower’s and following count was reduced by 1. A cache was also added in this API.



6)	PUT API – Follow a profile.
The purpose of this API is to make a user follow another user. Block validations are included. For example, when ‘a’ follows ‘b’, a’s following’s list is added with b’s data and a’s following count increases by 1. Similarly, b’s follower’s list is added with a’s data and follower’s count increases by 1. The updated data is then set into the Cache memory.



7)	PUT API – Unfollow a profile.
This API is completely opposite of the unfollow API. When ‘a’ unfollows ‘b’, a’s following count is reduced by 1 and the data of b in a’s following list is removed. Similarly, b’s follower count is reduced by 1 and the follower’s list’s data of a is completely removed. Block validation is included along with many others. The data is then set to the Cache memory.



8)	PUT API – Block a profile.
A negative feature, but had to tag this along in this project because it only made our other validation more complex! This API is used when you wish to block a person; once a person is blocked, they will not be able to access your profile, your posts, probably nothing! When a user is blocked, your data is removed from their follower’s and following’s list and their follower’s and following’s count is reduced by 1 respectively. And the same happens with the person who has blocked the other user. Your follower’s and following’s list will have not data of the other person and your follower’s and following’s count will be reduced by 1. The updated data is then set into the Cache memory.



9)	PUT API – Unblock a profile.
This API is the complete opposite of the block, but less complex. When a user is unblocked, you are able to see their details thoroughly. But then you need to go through the following process again, like the ‘Instagram’ of course.



10)  PUT API – Liking a post.
Each API has a ton of validations apart from the main validations being mentioned in the README, and this API might look like a small API to deal with but it really isn’t. If the post’s owner has blocked you, you will not be able to like or even view their post! But if not, then you are granted the permission to like their post. When liking a post, the post’s like’s list gets added with your data and the like’s count of that post gets increased by 1. The data is then updated in the cache memory.



11) PUT API – Un-liking a post.
This API is perhaps the complete opposite of the ‘liking a post’ API. Your name gets removed from the like’s list and the like’s count of that post is then reduced by 1. Block validations are taken care of. The updated data is then set to the cache memory.



12) PUT API – To comment on a post.
We have taken the postId we wish to comment on and the comment which needs to be posted on that particular post in the request body. Strict block validations are used. A user is free to comment on anybody’s post, but not anything. A user cannot post cuss words on somebody else’s post (not everything). The comment then along with the username of the person who has commented gets updated in the comment’s list of the post’s user and the comment’s count is increased by 1.



13) DELETE API – Delete a comment.
Pretty much deletes a comment but comes with heavy validations; if the user wants to delete comments on their own post, they are free to delete any comment. But if a user wants to delete a comment on somebody else’s post, they’re only allowed to delete only their own comment. This API also comes with strict block validations. After the comment is deleted, the comment’s count is reduced by one and the comment in the comment’s list which was supposed to be deleted, vanishes.



14) POST API – Creating a post.
This API has a ton of validations for each key being passed in the request body. Although only the image was kept mandatory, the location, and caption weren’t mandatory at all. AWS S3 is being used to upload pictures.



15) GET API – Fetching post details.
With strict validations, this API helps fetch the data of a particular post as shown exclusively on Instagram. Block validation has been taken care of. No cache was implemented here as fetching a post data would be a waste of cache memory, moreover the social media app such as Instagram doesn’t use cache to fetch details of other’s post.



16) GET API – Fetching comment’s list of a post.
The function of this API is to fetch the details of all the comments along with their comment’s count and to show the details in the response body. Block validation is taken care of. No cache was implemented here as fetching a post’s comment’s list would be a waste of cache memory, moreover the social media app such as Instagram doesn’t use cache to fetch details of other’s post’s comment’s list.



17) GET API – Fetching the like’s list of a post.
The function of this API is similar to that of the get comment’s list API; we’re trying to fetch the details of the like’s list of a post. Block validation is taken care of. No cache was implemented here as fetching a post’s like’s list would be a waste of cache memory, moreover the social media app such as Instagram doesn’t use cache to fetch details of other’s post’s like’s list.



18) PUT API – Updating a post.
There’s enough flexibility with this API. It allows to update or edit only the location or the caption of a post, probably the only two things one gets to edit on a post. 



19) DELETE API – Deleting a post.
This is a soft delete API, only the isDeleted keyword is set to true whenever the response is sent. You cannot delete somebody else’s post.



20) MIDDLEWARE – Authentication.
This is a middleware API which uses a JWT function called ‘jwt.verify’, which probably verifies if the user has logged in and the jwt token generated after logging in is present or not. This middleware is used in almost 95% of the APIs.



21) MIDDLEWARE – Authorization.
This again is a middleware which confirms that the jwt token generated after logging in is that of the user trying to send the request to the server. So JWT Token has three sections including Header, Payload and the Signature. The user details are stored in the payload, especially the profileId (in this case). So, checking the profileId which sends the request to the server to the profileId in the payload of the jwt token is the so called ‘Authorization’. This middleware too has been used in 95% of the APIs.


 In conclusion, although not fancy, but this is a genuine backend handle of a social medial platform. Took us around 6 days to build it.
 Thanks for reading, cheers! 
 
                                                                            - Shivani and Aashrun



