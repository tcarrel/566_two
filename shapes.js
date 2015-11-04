// Thomas R. Carrel
//
// shapes.js
//
//   Puts all of the shapes and initialization into a seperate file to clean 
// up the file with all of the functional code.


///////////////////////////////////////////////////////////////////////////////
//
//  Model initialization.
//
///////////////////////////////////////////////////////////////////////////////
function init_models(gl, shader_vars, shapes)
{

    for(var i = 0; i < shapes.length; i++ )
    {
        shapes[i].buffer = gl.createBuffer();
        {
            if ( shapes[i].buffer )
            {
                console.log(
                        '@ "' + shapes[i].name + '" was created succesfully.'
                        );
            }
            else
            {
                console.log(
                        'Failed to create "' +
                        shapety[i].name +
                        '" [' + i + "] buffer."
                        );
                return false;
            }
            gl.bindBuffer(gl.ARRAY_BUFFER, shapes[i].buffer);
            gl.bufferData(gl.ARRAY_BUFFER, shapes[i].verts, gl.STATIC_DRAW);
            gl.vertexAttribPointer(
                    shader_vars.a_pos, 2, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(shader_vars.a_pos);
        }
    }

    return true;
}

///////////////////////////////////////////////////////////////////////////////
//
//    rgba32( R, G, B, A )
//    
//    Converts 0-255 colors to the percentages used by WebGL.
//
//    R  :  Red
//    ---:-------
//    G  :  Green
//    ---:-------
//    B  :  Blue
//    ---:-------
//    A  :  Alpha
//
///////////////////////////////////////////////////////////////////////////////
function rgba32( R, G, B, A )
{
    if( R > 255 ) R = 255;
    if( R < 0 )   R = 0;
    if( G > 255 ) G = 255;
    if( G < 0 )   G = 0;
    if( B > 255 ) B = 255;
    if( B < 0 )   B = 0;
    if( A > 1.0 ) A = 255;
    if( A < 0 )   A = 0;

    return new Float32Array
        ([ R/255, G/255, B/255, A/255 ]);
}

///////////////////////////////////////////////////////////////////////////////
//
//    Returns all the verticies in a circle.
//
//  steps  :  The number of verticies along the circumference of the circle.
//         : Two more verticies than this are created for the entire circle.
//         : One for the central point, the other because the first point on
//         : the circumference of the circle must be generated a second time at
//         : the end of the arc so that a complete circle is created instead of
//         : a "Pac-Man" shape.
//
///////////////////////////////////////////////////////////////////////////////
function circle_verts(steps, x, y)
{
    var vert_qty = steps + 2; 
    var step_arc = 360 / steps;
    var angle    = 0;
    var radius   = 0.5;

    var circle = [ 0.0, 0.0 ];

    // Step through the circle calculating coords one vert at a time.
    for( var vert_cur = 1; vert_cur < vert_qty; vert_cur++ )
    {
        var i         = vert_cur * 2;
        var theta     = (Math.PI / 180.0) * angle; // Winners use radians...

        // Convert from polar to cartesian coordinates and store point.
        circle.push(radius * Math.cos(theta)) + x;
        circle.push(radius * Math.sin(theta)) + y;

        angle         = angle + step_arc; // Update angle for next itteration.
    }

    return new Float32Array(circle);
}

///////////////////////////////////////////////////////////////////////////////
//  
//   Creates all the shapes need.
//
//  gl  :  The current WebGL rendering context.
//
///////////////////////////////////////////////////////////////////////////////
function get_shapes(gl)
{

    var steps_in_circle = 180; // This must divide or be a multiple of 360.
    var pyth_pos        = Math.sqrt(0.75)/2.0; //Just calculate these once.
    var pyth_neg        = pyth_pos * -1;
    var tri_offs        = pyth_pos / 3;
    pyth_pos            = pyth_pos + tri_offs;
    pyth_neg            = pyth_neg + tri_offs;
    var id_mat          = new Matrix4; id_mat.setIdentity();

    return [
    {
        name: "square",
            verts: new Float32Array
                ([ 
                 0.5,  0.5,
                 0.5, -0.5,
                 -0.5,  0.5,
                 -0.5, -0.5
                 ]),
            color: rgba32( 255, 255, 0, 128 ),
            mode: gl.TRIANGLE_STRIP,
            buffer: 0,
            model_matrix: new Matrix4,
            point_size: 1.0
    }
    ,
        {
            name: "equilateral triangle",
            verts: new Float32Array
                ([
                 0.0, pyth_pos,
                 -0.5, pyth_neg,
                 0.5, pyth_neg
                 ]),
            color: rgba32( 127, 127, 255, 191 ),
            mode: gl.TRIANGLES,
            buffer: 0,
            model_matrix: new Matrix4,
            point_size: 1.0
        }
    , 
        {
            name: "circle",
            verts: circle_verts(steps_in_circle, 0.5, 0),
            color: rgba32( 42, 42, 42, 255 ),
            mode: gl.TRIANGLE_FAN,
            buffer: 0,
            model_matrix: new Matrix4,
            point_size: 1.0
        }
    ,
        {
            name: "hexagon",
            verts: circle_verts(6, 0, 0),
            color: rgba32( 255, 0, 255, 255 ),
            mode: gl.LINE_STRIP,
            buffer: 0,
            model_matrix: new Matrix4,
            point_size: 1.0
        }
    ,
        {
            name: "stars",
            verts: circle_verts(90, 0, 0),
            color: rgba32( 0, 255, 0, 128 ),
            mode: gl.POINTS,
            buffer: 0,
            model_matrix: new Matrix4,
            point_size: 5.0
        }
    ,
        {
            name: "stars",
            verts: circle_verts(90, 0, 0),
            color: rgba32( 255, 0, 0, 128 ),
            mode: gl.POINTS,
            buffer: 0,
            model_matrix: new Matrix4,
            point_size: 4.8
        }
    ,
        {
            name: "triforce",
            verts: new Float32Array
                ([
                 -0.25, tri_offs,   0.0, pyth_pos, 0.25, tri_offs,
                 -0.5,  pyth_neg, -0.25, tri_offs, 0.00, pyth_neg,
                 0.0,   pyth_neg,  0.25, tri_offs, 0.50, pyth_neg
                 ]),
            color: rgba32( 185, 122, 87, 255 ),
            mode: gl.TRIANGLES,
            buffer: 0,
            model_matrix: new Matrix4,
            point_size: 1.0
        }
    ,
        {
            name: "X",
            verts: new Float32Array
                ([ //Arranged by start and end points of each line segment.
                 0.0000,  0.0625,
                 0.4375,  0.5000,
                 0.5000,  0.4375,
                 0.0625,  0.0000,
                 0.5000, -0.4375,
                 0.4357, -0.5000,
                 0.0000, -0.0625,
                 -0.4375, -0.5000,
                 -0.5000, -0.4375,
                 -0.0625, 0.0000,
                 -0.5000,  0.4375,
                 -0.4375,  0.5000
                 ]),
            color: rgba32( 0, 0, 0, 255 ),
            mode: gl.LINE_LOOP,
            buffer: 0,
            model_matrix: new Matrix4,
            point_size: 1.0
        }
    ,
        {
            name: "grid",
            verts: new Float32Array
                ([ //Grouped by line segment.
                 -1.0,  0.75, 1.00,  0.75,
                 -1.0,  0.50, 1.00,  0.50,
                 -1.0,  0.25, 1.00,  0.25,
                 -1.0, -0.25, 1.00, -0.25,
                 -1.0, -0.50, 1.00, -0.50,
                 -1.0, -0.75, 1.00, -0.75,
                 0.75, -1.00, 0.75,  1.00,
                 0.50, -1.00, 0.50,  1.00,
                 0.25, -1.00, 0.25,  1.00,
                 -0.25,-1.00,-0.25,  1.00,
                 -0.50,-1.00,-0.50,  1.00,
                 -0.75,-1.00,-0.75,  1.00
                 ]),
            color: rgba32( 0, 255, 0, 128 ),
            mode: gl.LINES,
            buffer: 0,
            model_matrix: id_mat,
            point_size: 1.0
        }
    ,
        {
            name: "axis",
            verts: new Float32Array
                ([
                 -1.0, 0.0,
                 1.0, 0.0,
                 0.0, -1.0,
                 0.0, 1.0
                 ]),
            color: rgba32( 255, 0, 0, 255 ),
            mode: gl.LINES,
            buffer: 0,
            model_matrix: id_mat,
            point_size: 1.0
        }
    ,
        {
            name: "arrow",
            verts: new Float32Array
                ([
                 -0.25, 0.125,
                 0.125, 0.125,
                 0.125, 0.25,
                 0.25, 0.0,
                 0.125, -0.25,
                 0.125, -0.125,
                 -0.25, -0.125
                 ]),
            color: rgba32( 255, 255, 255, 255 ),
            mode: gl.LINE_LOOP,
            buffer: 0,
            model_matrix: new Matrix4,
            point_size: 1.0
        }
    ];
}
