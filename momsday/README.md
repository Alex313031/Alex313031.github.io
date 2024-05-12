# Procedural Flowers (WebGL)

![Finished result](http://www.adrianherbez.net/wp-content/uploads/2020/06/glflower_spin2-1.gif)

## Example flower
This was a project to create procedural flowers using pure WebGL. All of the geometry and textures are generated via code, and the only external library used is glMatrix. The flowers are also generated using a seed derived from lat-long coordinates, so specific flowers can be generated for specific locations. To see it in action, head here.

# Development Process

## Step 1: Flat leaves
The project happened over the course of about a week and a half. I started by generating flat, 2d versions of leaves:

![glflower 1](http://www.adrianherbez.net/wp-content/uploads/2020/06/glflower1.png)

I started by implementing Bezier curves, then using two cubic curves to set the shape of the leaf edge and generating faces to fill in the contents. I also set up a simple shader to have the center of the leaf be a bit red, fading to green at the edges. See this version head here: http://www.adrianherbez.net/glflower/01/.

## Step 2: 3d Leaves
Once I had the basic 2d leaf working, it was time to add additional cubic curves to make it bend backwards along its length as well as to curve gently away from the spine of the leaf.

![glflower 2](http://www.adrianherbez.net/wp-content/uploads/2020/06/glflower2.png)

To see this in action, head here: http://www.adrianherbez.net/glflower/02/.

## Step 3: Adding a Stem
Once I was happy with the leaf shapes, I added in a gently curving stem, and added leaves along the length.

![glflower 3](http://www.adrianherbez.net/wp-content/uploads/2020/06/glflower3.png)

This also had its own shader, but with the color gradient changing along its length. See it here: http://www.adrianherbez.net/glflower/03/

## Step 4: Expanding leaves to petals, normals
At this point, it was time to move onto the flower itself. I refactored the code for the leaf to be more general, making it a general class for creating geometry from sets of curves (XY, XZ, and YZ). By changing the curves, it was easy to go from pointy leaves to more bell-like petals.

![glflower 4](http://www.adrianherbez.net/wp-content/uploads/2020/06/glflower4.png)

I also added in proper normal calculations for the faces, which also meant writing a normal shader for easy debugging. All of the geometry is rendered double-sided, with one side rendering with the normal color and the other either red (for petals) or green (for leaves).
See this version here: http://www.adrianherbez.net/glflower/04/

## Step 5: Lathed Geometry
In order to create the central part of the flower, I created a LathedGeometry class that could take a curve and spin it around the Y axis to generate a sealed piece of geometry.

![glflower 5](http://www.adrianherbez.net/wp-content/uploads/2020/06/glflower5.png)

See it in action here: http://www.adrianherbez.net/glflower/05/. Each refresh of the page makes a slightly different model.

## Step 6: Putting it all together
Now that I had all of the parts I needed, I put it all together into a full flower, with a stem, leaves, a central element, and petals.

![glflower 6](http://www.adrianherbez.net/wp-content/uploads/2020/06/glflower6.png)

The colors look a bit crazy, but that’s because I was still using the normal shader as a diagnostic. It makes a lot more sense if you see it moving- to do that, head here: http://www.adrianherbez.net/glflower/06/. Moving the mouse in the canvas will change the angle of the flower (added that in to make it easier to see what was going on).

## Step 7: Colors!
With all of the geometry in, I started working on better colors for the shaders.

![glflower 7](http://www.adrianherbez.net/wp-content/uploads/2020/06/glflower7.png)

See it in action here: http://www.adrianherbez.net/glflower/07/.
 
## Step 8: Lat-long based seed values
Now that the flower was close to done, I turned my attention to adding support for a lat/long-derived seed value.

![glflower 8](http://www.adrianherbez.net/wp-content/uploads/2020/06/glflower8.png)

Once set, the same seed is used for all the randomized generation, allowing any place in the world to have its own unique flower. At this point, the colors were still always the same though. See it here: http://www.adrianherbez.net/glflower/08/

## Step 9: Finishing Touches
I was pretty happy with things at this point, but added a few things here and there to provide some polish, namely:
– randomized colors for the petals
– modification of the leaf shader to have stripes on the underside
– changed the background color to a nice medium gray

If you’ve made it this far, thanks for reading! Be sure to see the final result here: http://www.adrianherbez.net/glflower/.

Also, if you’d like to have a look at the code, it’s available on Github here: https://github.com/aherbez/glflower