export class SquarePyramid {
    constructor(gl, options = {}) {
        this.gl = gl;

        // VAO, VBO, EBO 생성
        this.vao = gl.createVertexArray();
        this.vbo = gl.createBuffer();
        this.ebo = gl.createBuffer();

        // ----------------------------
        // 1. 정점 위치 (vertices)
        // ----------------------------
        // 밑면(Base): A, B, C, D  
        //     A = (-0.5, 0, -0.5)  
        //     B = ( 0.5, 0, -0.5)  
        //     C = ( 0.5, 0,  0.5)  
        //     D = (-0.5, 0,  0.5)
        //
        // 측면(Side Faces): 각 면은 밑면의 한 변과 apex(E)를 이용한 삼각형
        //     Front face: D, C, E  
        //     Right face: C, B, E  
        //     Back face:  B, A, E  
        //     Left face:  A, D, E  
        // 
        // apex (E): (0, 1, 0)  → 높이가 1이 되도록 함
        this.vertices = new Float32Array([
            // Base face (4 vertices)
            -0.5, 0.0, -0.5,    // A
             0.5, 0.0, -0.5,    // B
             0.5, 0.0,  0.5,    // C
            -0.5, 0.0,  0.5,    // D

            // Front face (triangle): D, C, E
            -0.5, 0.0,  0.5,    // D (재정의)
             0.5, 0.0,  0.5,    // C (재정의)
             0.0, 1.0,  0.0,    // E (apex)

            // Right face (triangle): C, B, E
             0.5, 0.0,  0.5,    // C
             0.5, 0.0, -0.5,    // B
             0.0, 1.0,  0.0,    // E

            // Back face (triangle): B, A, E
             0.5, 0.0, -0.5,    // B
            -0.5, 0.0, -0.5,    // A
             0.0, 1.0,  0.0,    // E

            // Left face (triangle): A, D, E
            -0.5, 0.0, -0.5,    // A
            -0.5, 0.0,  0.5,    // D
             0.0, 1.0,  0.0     // E
        ]);

        // ----------------------------
        // 2. 정점 노멀 (normals)
        // ----------------------------
        // 각 면의 평면 노멀 (이미 정규화된 근사치 사용)
        this.normals = new Float32Array([
            // Base face (4 vertices): 밑면의 바깥쪽은 아래를 향하도록 (0, -1, 0)
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,
             0.0, -1.0,  0.0,

            // Front face (triangle): (0, 0.4472, 0.8944)
             0.0,  0.4472,  0.8944,
             0.0,  0.4472,  0.8944,
             0.0,  0.4472,  0.8944,

            // Right face (triangle): (0.8944, 0.4472, 0)
             0.8944,  0.4472,  0.0,
             0.8944,  0.4472,  0.0,
             0.8944,  0.4472,  0.0,

            // Back face (triangle): (0, 0.4472, -0.8944)
             0.0,  0.4472, -0.8944,
             0.0,  0.4472, -0.8944,
             0.0,  0.4472, -0.8944,

            // Left face (triangle): (-0.8944, 0.4472, 0)
            -0.8944,  0.4472,  0.0,
            -0.8944,  0.4472,  0.0,
            -0.8944,  0.4472,  0.0
        ]);

        // ----------------------------
        // 3. 정점 색상 (colors)
        // ----------------------------
        // 옵션으로 전체 색상을 지정할 수 있으며, 지정하지 않으면 각 면마다 다른 색상을 사용
        if (options.color) {
            // 만약 color 옵션이 주어지면 모든 정점에 그 색상을 적용
            this.colors = new Float32Array(16 * 4);
            for (let i = 0; i < 16 * 4; i += 4) {
                this.colors[i] = options.color[0];
                this.colors[i + 1] = options.color[1];
                this.colors[i + 2] = options.color[2];
                this.colors[i + 3] = options.color[3];
            }
        } else {
            this.colors = new Float32Array([
                // Base face (4 vertices): 파란색 (0, 0, 1, 1)
                0, 0, 1, 1,
                0, 0, 1, 1,
                0, 0, 1, 1,
                0, 0, 1, 1,

                // Front face (triangle): 빨간색 (1, 0, 0, 1)
                1, 0, 0, 1,
                1, 0, 0, 1,
                1, 0, 0, 1,

                // Right face (triangle): 노란색 (1, 1, 0, 1)
                1, 1, 0, 1,
                1, 1, 0, 1,
                1, 1, 0, 1,

                // Back face (triangle): 자홍색 (1, 0, 1, 1)
                1, 0, 1, 1,
                1, 0, 1, 1,
                1, 0, 1, 1,

                // Left face (triangle): 청록색 (0, 1, 1, 1)
                0, 1, 1, 1,
                0, 1, 1, 1,
                0, 1, 1, 1
            ]);
        }

        // ----------------------------
        // 4. 텍스처 좌표 (texCoords)
        // ----------------------------
        // Base face: 정사각형 매핑; 각 삼각형 면: 좌측하단 (0,0), 우측하단 (1,0), apex (0.5,1)
        this.texCoords = new Float32Array([
            // Base face (4 vertices)
            0.0, 0.0,
            1.0, 0.0,
            1.0, 1.0,
            0.0, 1.0,

            // Front face (triangle)
            0.0, 0.0,
            1.0, 0.0,
            0.5, 1.0,

            // Right face (triangle)
            0.0, 0.0,
            1.0, 0.0,
            0.5, 1.0,

            // Back face (triangle)
            0.0, 0.0,
            1.0, 0.0,
            0.5, 1.0,

            // Left face (triangle)
            0.0, 0.0,
            1.0, 0.0,
            0.5, 1.0
        ]);

        // ----------------------------
        // 5. 정점 인덱스 (indices)
        // ----------------------------
        // Base: 2개의 삼각형, 각 삼각형 3개의 인덱스  
        // 측면: 각 삼각형 면은 3개 인덱스
        this.indices = new Uint16Array([
            // Base face
             0, 1, 2,
             2, 3, 0,
            // Front face
             4, 5, 6,
            // Right face
             7, 8, 9,
            // Back face
            10, 11, 12,
            // Left face
            13, 14, 15
        ]);

        // 평면 노멀(면 노멀)과 정점 노멀은 동일하게 설정(세부적인 정규화 처리가 필요하지 않은 경우)
        this.vertexNormals = new Float32Array(this.normals);
        this.faceNormals = new Float32Array(this.normals);

        // 버퍼 초기화
        this.initBuffers();
    }

    copyVertexNormalsToNormals() {
        this.normals.set(this.vertexNormals);
    }

    copyFaceNormalsToNormals() {
        this.normals.set(this.faceNormals);
    }

    initBuffers() {
        const gl = this.gl;

        const vSize = this.vertices.byteLength;
        const nSize = this.normals.byteLength;
        const cSize = this.colors.byteLength;
        const tSize = this.texCoords.byteLength;
        const totalSize = vSize + nSize + cSize + tSize;

        gl.bindVertexArray(this.vao);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
        gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);  // 위치
        gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize);  // 노멀
        gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize);  // 색상
        gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize);  // 텍스처 좌표

        gl.enableVertexAttribArray(0);
        gl.enableVertexAttribArray(1);
        gl.enableVertexAttribArray(2);
        gl.enableVertexAttribArray(3);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    updateNormals() {
        const gl = this.gl;
        const vSize = this.vertices.byteLength;

        gl.bindVertexArray(this.vao);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
        gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindVertexArray(null);
    }

    draw(shader) {
        const gl = this.gl;
        shader.use();
        gl.bindVertexArray(this.vao);
        gl.drawElements(gl.TRIANGLES, 18, gl.UNSIGNED_SHORT, 0);
        gl.bindVertexArray(null);
    }

    delete() {
        const gl = this.gl;
        gl.deleteBuffer(this.vbo);
        gl.deleteBuffer(this.ebo);
        gl.deleteVertexArray(this.vao);
    }
}
