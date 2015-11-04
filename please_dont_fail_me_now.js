//  Thomas Russel Carrel
//
//  please_dont_fail_me_now.js
//
//    update() and the basic form of main() are based heavily off of Judy
//  Challinger's "Two Buffers" WebGL example and early examples from "WebGL
//  Programming Guide: Interactive 3D Graphics Programming with WebGL" by
//  Matsuda, Kouichi.

"use strict";

// Entry point
function main()
{
    var shader_vars = 
    {
        u_xform:0,
        a_pos:0,
        a_p_size:0,
        u_color:0
    };

    // Get WebGL rendering target.
    var canvas = document.getElementById('render_to');
    var gl = getWebGLContext(canvas);
    if( !gl ) 
    {
        console.log('Could not get WebGL rendering context.');
        return;
    }

    // Setup buttons (user interactions).
    var speed_button = document.getElementById('speed');
    var speed        = 1.0;
    var angle        = 0.0;
    var speed_toggle = function()
    {
        speed = speed + 0.1;
        if( speed > 2.0 )
        {
            speed = 1.0;
        } 
    };
    speed_button.onclick = speed_toggle;

    var dir_button = document.getElementById('direction');
    var direction  = 1.0;
    var dir_toggle = function()
    {
        direction = direction * -1.0;
        //console.log("direction = " + direction);
    };
    dir_button.onclick = dir_toggle;

    var pause_button = document.getElementById('pause');
    var is_paused    = false;
    var pause_toggle = function()
    {
        is_paused = !is_paused;
    };
    pause_button.onclick = pause_toggle;

    // Hard-coded objects go here.
    var shaders = get_shaders(); // shaders are in a seperate file.

    // Set shaders and bind shader vars.
    if( !initShaders(gl, shaders[0], shaders[1]) )
    {
        console.log('Shaders could not initialize.');
        return;
    }

    shader_vars.u_xform =
        gl.getUniformLocation(gl.program, 'u_xform');
    if( shader_vars.u_xform < 0 )
    {
        console.log("Failed to bind location of 'u_xform.'");
        return;
    }

    shader_vars.a_pos = gl.getAttribLocation(gl.program, 'a_pos');
    if( shader_vars.a_pos < 0 )
    {
        console.log("Failed to bind location of 'a_pos.'");
        return;
    }

    shader_vars.a_p_size = gl.getAttribLocation(gl.program, 'a_p_size');
    if( shader_vars.a_p_size < 0 )
    {
        console.log("Failed to bind location of 'a_p_size.'");
        return;
    }

    shader_vars.u_color = gl.getUniformLocation(gl.program, 'u_color');
    if( shader_vars.u_color < 0 )
    {
        console.log("Failed to bind location of 'u_color.'");
        return;
    }

    var shapes  = get_shapes(gl); // These are in shape.js
    if( !init_models(gl, shader_vars, shapes) )
    {
        console.log("Failed to initialize primatives.");
        return;
    }

    // Set clear color and clear the canvas.
    gl.clearColor(128/255, 128/255, 128/255, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    var chrono = Date.now();
    var tick   = function()
    {
        update( shapes, chrono, speed, angle, direction, is_paused );
        render( gl, shader_vars, shapes );
        requestAnimationFrame( tick, canvas );
    };
    tick();
}

///////////////////////////////////////////////////////////////////////////////
//
//   update( shapes, chrono, speed, angle, is_paused );
//
//   Updates the next animation frame.
//
//   shapes    :  The shapes being updated.
//   ----------:--------------------------------------------------------------
//   chrono    :  The time stamp of the previous fram.
//   ----------:--------------------------------------------------------------
//   speed     :  The speed of movement.
//   ----------:--------------------------------------------------------------
//   angle     :  Two angles of rotation (changing in opposite directions). 
//   ----------:--------------------------------------------------------------
//   direction :  Direction of rotation must == +/- 1.0, other values will
//             : result in undefined behavior.
//   ----------:--------------------------------------------------------------
//   is_paused :  Boolean storing animation state (true == paused).
//
///////////////////////////////////////////////////////////////////////////////
function update( shapes, chrono, speed, angle, direction, is_paused )
{
    if( is_paused )
        return;

    var now      = Date.now();
    var dur      = now - chrono;
    chrono       = now;
    var one_rt_2 = 1 / Math.sqrt(2.0);
    var rot_ax   = [ 0, 0, 1 ];
    var angle2   = 0.0;

    // Calculate the new angles of rotation.
    var angle_delta = (30 * dur * speed) / 1000.0;

    angle = angle + angle_delta;
    angle2 = 0.0 - angle;

    if( angle < 0 )
    {
        angle = 360 - angle;
    }

    angle2 = 360 - angle2;
    angle  = angle  % 360;
    angle2 = angle2 % 360;

    angle  = direction * angle;
    angle2 = direction * angle2;
    //
    // Set translations for the first shape, the rest are caculated based
    //on these.  The position of each shape should be constant.
    var x_offset = -0.75;
    var y_offset =  0.75;

    var rotation = 0.0;
    for(var i = 0; i < shapes.length; i++)
    {
        var name = shapes[i].name;
        // Ignore the static grid and axis elements.
        if( name !== "grid" && name !== "axis" && name !== "arrow" ) 
        {
            if( name == "circle" )
            {
                rot_ax = [ 1, 1, 1 ];
            } 
            else
            {
                rot_ax = [ 0, 0, 1 ];
            }
            if( i % 2 )
            {
                rotation = angle;
            }
            else
            {
                rotation = -1.0 * angle;
            }

            if( name == "stars" )
            {
                shapes[i].model_matrix.setScale( 1.9, 1.9, 0 );
                shapes[i].model_matrix.rotate(
                        rotation,
                        rot_ax[0],
                        rot_ax[1],
                        rot_ax[2]
                        );
            }
            else
            {
                shapes[i].model_matrix.setTranslate( x_offset, y_offset, 0 );
                shapes[i].model_matrix.scale(
                        one_rt_2 / 2,
                        one_rt_2 / 2,
                        1 );
                shapes[i].model_matrix.rotate(
                        rotation,
                        rot_ax[0],
                        rot_ax[1],
                        rot_ax[2] );
            }


            // Calculate the translations for the next shapes.
            x_offset += 0.5;
            if( x_offset > 1.0 )
            {
                x_offset = -0.75;
                y_offset -= 0.5;
                if( y_offset < -1.0 )
                {
                    y_offset = 0.75;
                }
            }
        }
        if( name === "arrow" )
        {
            shapes[i].model_matrix.setScale( direction, 1.0, 1.0, 1.0 );
        }
    }
}

///////////////////////////////////////////////////////////////////////////////
//
//  Renders all shapes in the shapes array...
//
///////////////////////////////////////////////////////////////////////////////
function render( gl, shader_vars, shapes )
{

    //clear the context (canvas).
    gl.clear( gl.COLOR_BUFFER_BIT );

    //Draw all primitives.
    var shape_qty = shapes.length;
    for( var q = 0; q < shape_qty; q++ )
    {
        gl.uniform4fv(
                shader_vars.u_color,
                shapes[q].color );
        gl.uniformMatrix4fv(
                shader_vars.u_xform,
                false,
                shapes[q].model_matrix.elements );
        gl.bindBuffer( gl.ARRAY_BUFFER, shapes[q].buffer);
        gl.vertexAttribPointer(
                shader_vars.a_pos, 2, gl.FLOAT, false, 0, 0 );
        gl.vertexAttrib1f( shader_vars.a_p_size, shapes[q].point_size );
        //console.log('Drawing "' + shapes[q].name + '."');
        gl.drawArrays(
                shapes[q].mode,
                0,
                shapes[q].verts.length / 2 );

    }
}
