# SocialMedia-Project



ReadMe:
Profile Controller –

1)	Register Api: profile/register
•	Create a profile document from request body. Request body must contain image.
•	Upload image to S3 bucket and save its public URL in user document.
•	Handle edge cases like extra spaces in between name and bio.
•	On success send 201, and send the appropriate status code if error persists.

2)	Login Api: profile/login

•	Allow a user to login with their email/mobileNo and password.
•	Get email, mobileNo and password in the request body, if !email && !mobileNo then  return error.
•	Can login through email or mobileNo, these two will not be mandatory but password.
•	On a successful login attempt return the profileId and a JWT token containing the userId, exp, iat.
•	On success send 200, and send the appropriate status code if error persists.


3)	Get Own Profile Api: profile/:profileId/getOwnProfile
•	Allow a user to fetch details of their own profile.
•	Check if the profileId exists in the database
•	Authentication and Authorization required
•	Response structure – [fullName, userName, postCount, followersCount, followingCount, postData, bio, profileImage]
•	Make sure that the profileId exists/ isDeleted is false
•	On success send 200, and send the appropriate status code if error persists.



4) Update Api: profile/:profileId/update
•	Authentication and Authorization required
•	Check if profileId exists in the db.
•	Get [userName, fullName, password, email, mobileNo, bio, profileImage, location] in the request body and only they can be edited. Keys like [followers, following and postCount] cannot be edited/updated.
•	On a successful update, send the updated document in the response body.
•	Response structure – [fullName, userName, postCount, length of followers, length of following, postData, bio, profileImage]
•	Make sure that the profileId exists/ isDeleted is false
•	On success send 200, and send the appropriate status code if error persists.



5) Delete Api: profile/:profileId/delete
•	Authentication and Authorization required
•	Deletes the profile
•	Make sure that the profileId exists/ isDeleted is false
•	While deleting a profile, ensure all the posts related to the profile are also deleted.
•	On success send 200, and send the appropriate status code if error persists.




6) Comment Api: profile/:profileId/comment
•	Authentication and Authorization required
•	Get postId and comment in the request body
•	Check if postId exists in the db.
•	You can comment on your own post, check if postId has your own profileId.
•	You can comment other’s post as well
•	While commenting, increase the number of comments on the post of whosever post it is and send only the updated count of that post in response body.
•	If you exist in their blockedAccount’s array, you cannot comment.
•	Make sure that the profileId exists/ isDeleted is false
•	On success send 200, and send the appropriate status code if error persists.



7) Like Api: profile/:profileId/like
•	Authentication and Authorization required
•	Check if profileId exists in the db.
•	Get postId in the request body
•	Check if postId exists in the db.
•	You can like your own post, check if postId has your own profileId.
•	You can like other’s post as well
•	While liking, increase the number of comments on the post of whosever post it is and send only the updated count of that post in response body.
•	If you exist in their blockedAccount’s array, you cannot comment.
•	Make sure that the profileId exists/ isDeleted is false
•	On success send 200, and send the appropriate status code if error persists.


8) Follow Api – profile/:profileId/follow
•	Authentication and Authorization required
•	Check if profileId exists in the db.
•	Get 2nd person’s profileId in request body.
•	Check if profileId of 2nd person exists in the db.
•	When you hit the request, 2nd person’s followersCount increases by 1, while your followingCount increases by one.
•	If you exist in their blockedAccount’s array, you cannot follow.
•	Make sure that the profileId exists/ isDeleted is false
•	On success send 200, and send the appropriate status code if error persists.


9) Get Details of other acc’s API: profile/:profileId/getOtherAcc
•	Authentication and Authorization required
•	Get the profileId you want to search details for in the request body.
•	Check if profileId exists in the db.
•	Blocked contact cannot access your details.
•	Response structure – [fullName, userName, postCount, followersCount, followingCount, postData, bio, profileImage].
•	Make sure that the profileId exists/ isDeleted is false
•	On success send 200, and send the appropriate status code if error persists



10) Block Api: profile/:profileId/block
•	Authentication and Authorization required
•	Make sure profileId exists in the db.
•	Get the profileId of the person you want to block in the request body.
•	Make sure that the 2nd person exists in the db, and isDeleted is false.
•	Block the account by sending the request, the profileId of the blocked account gets added to you “blockedAccounts” key. 
•	The blocked person now cannot access your profile or posts. While blocking, make sure the 2nd person is removed from your followingList and followerList and bothe of them have a reduced count by 1. 
•	On success send 200, and send the appropriate status code if error persists


11) Unblock Api: profile/:profileId/unblock
•	Authentication and Authorization is required.
•	Make sure the profile exists in the db.
•	Get the profileId of the person you want to block in the request body.
•	Make sure the blocked Id exists in the db and isDeleted false.
•	Splice the profileId of the blocked id from your blockedAccount’s array.
•	Make sure they get to fetch your details after they get unblocked.
•	On success send 200, and send the appropriate status code if error persists



















Post Controller –



12)	Create Post Api: post/create
•	Create a post document from request body. Request body must contain image.
•	Upload image to S3 bucket and save its public URL in user document.
•	Handle edge cases like extra spaces in captions.
•	On success send 201, and send the appropriate status code if error persists.

13)	Get Post Api: post/:postId
•	Fetch data of a post. Authentication required.
•	Make sure that profileId exists in the db.
•	Make sure that the post exists in the db and isDeleted is false.
•	Blocked contact cannot access your details.
•	Return the entire data in the request body.
•	On success send 200, and send the appropriate status code if error persists.




14)	Get Likes List Api: post/:profileId/getLikesList/:postId
•	Authentication and Authorization is required.
•	Check if profileId exists in the db.
•	Check if post exists and isDeleted – false
•	Blocked contact cannot access your details.
•	Fetch the details of all the profiles who have liked the post.
•	Your response structure should have the likesCount, and likesList.
•	On success send 200, and send the appropriate status code if error persists.


15)	Get Comments List Api: post/:profileId/getCommentsList/:postId
•	Authentication and Authorization is required.
•	Check if profileId exists in the db.
•	Check if post exists and isDeleted – false
•	Blocked contact cannot access your details.
•	Fetch the details of all the profiles who have commented on the post.
•	Your response structure should have the commentsCount, and commentsList.
•	On success send 200, and send the appropriate status code if error persists



16)	Update Post Api: post/:profileId/updatePost/:postId
•	Updates YOUR post.
•	Authentication and Authorization is required.
•	Ensure that profileId exists in the db and isDeleted is false.
•	Ensure that postId exists in the db and isDeleted is false.
•	Can only update caption, location and YOUR comments, only if the post is yours. 
•	On success send 200, and send the appropriate status code if error persists.



17)	Delete Comment Api: post/:profile/deleteComment/:commentId
•	If the post is yours, then you can delete all the comments regardless of the user. But if the post is not yours, you can only delete your comment.
•	Authentication and Authorization is required.
•	Check if post exists.
•	Check if comment exists.
•	Splice it off.
•	On success send 200, and send the appropriate status code if error persists.

18)	Delete Post Api: post/:profile/deletePost/:postId
•	If the post is yours, then you can delete the post.
•	Authentication and Authorization is required.
•	Check if post exists.
•	Check if the post is of the same user as in the params.
•	On success send 200, and send the appropriate status code if error persists.









