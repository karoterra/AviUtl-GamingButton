local eps = 1e-9

--[[
    �����������߂�
]]
local function cbrt(x)
    local sign = 1
    if x < 0 then
        sign = -1
        x = -x
    end
    return sign * (x ^ (1/3))
end

--[[
    x���N���b�s���O����
]]
local function clip(x, min, max)
    if x < min then
        x = min
    end
    if x > max then
        x = max
    end
    return x
end

--[[
    1�������������� (a1 x + a0 = 0)
    �����F�������̌W��
    �߂�l�F���̔z��
]]
local function solveLinear(a1, a0)
    local x = {}
    if math.abs(a1) > eps then
        x[1] = -a0 / a1
    end
    return x
end

--[[
    2���������̎����������߂� (a2 x^2 + a1 x + a0 = 0)
    �����F�������̌W��
    �߂�l�F���̔z��
]]
local function solveQuadratic(a2, a1, a0)
    if math.abs(a2) < eps then
        return solveLinear(a1, a0)
    end

    local x = {}
    local a2_double = 2 * a2
    local discriminant = a1 * a1 - 4 * a2 * a0
    if math.abs(discriminant) < eps then
        -- �d��
        x[1] = -a1 / a2_double
    elseif discriminant > 0 then
        -- �قȂ�2������
        local disc_sqrt = math.sqrt(discriminant)
        x[1] = (-a1 - disc_sqrt) / a2_double
        x[2] = (-a1 + disc_sqrt) / a2_double
    end

    return x
end

--[[
    3���������̎����������߂� (a3 x^3 + a2 x^2 + a1 x + a0 = 0)
    �����F�������̌W��
    �߂�l�F���̔z��
]]
local function solveCubic(a3, a2, a1, a0)
    if math.abs(a3) < eps then
        return solveQuadratic(a2, a1, a0)
    end

    local x = {}
    local A, B, C = a2 / a3, a1 / a3, a0 / a3
    local A_div3 = A / 3
    local p = B - A_div3 * A
    local q = C - A_div3 * B + 2 * A_div3 ^ 3
    local q_half = q / 2
    local p_div3 = p / 3
    local discriminant = q_half *q_half + p_div3 ^ 3
    if math.abs(discriminant) < eps then
        -- �����̏d�������ꍇ
        local q_half_cbrt = cbrt(q_half)
        x[1] = -2 * q_half_cbrt - A_div3
        x[2] = q_half_cbrt - A_div3
    elseif discriminant > 0 then
        -- 1�̎�����
        local disc_sqrt = math.sqrt(discriminant)
        x[1] = cbrt(-q_half + disc_sqrt) + cbrt(-q_half - disc_sqrt) - A_div3
    else
        -- �قȂ�3������
        local a = 2 * math.sqrt(-p_div3)
        local theta = math.atan2(math.sqrt(-discriminant), -q_half) / 3
        x[1] = a * math.cos(theta) - A_div3
        x[2] = a * math.cos(theta + math.pi * 2 / 3) - A_div3
        x[3] = a * math.cos(theta - math.pi * 2 / 3) - A_div3
    end

    return x
end

--[[
    3���x�W�F�Ȑ����g�����C�[�W���O�֐�
    �n�_��(0, 0)�A�I�_��(1, 1)�A����_��(x1, y1), (x2, y2)
    �����F
        t�F���Ԃ̊���(0 <= t <= 1)
        x1�F����_1��x���W(0 <= x1 <= 1)
        y1�F����_1��y���W
        x2�F����_2��x���W(0 <= x2 <= 1)
        y2�F����_2��y���W
    �߂�l�F�o�͊����Bt=0�̂Ƃ�0�At=1�̂Ƃ�1
]]
local function cubicBezierEasing(t, x1, y1, x2, y2)
    x1 = clip(x1, 0, 1)
    x2 = clip(x2, 0, 1)

    local x1_triple, x2_triple = x1 * 3, x2 * 3
    local cubic_solutions = solveCubic(1 + x1_triple - x2_triple, x2_triple - x1_triple - x1_triple, x1_triple, -t)
    local s = 0
    for i, val in pairs(cubic_solutions) do
        if 0 <= val + eps and val - eps <= 1 then
            s = clip(val, 0, 1)
            break
        end
    end

    local y1_triple, y2_triple = y1 * 3, y2 * 3
    return (1 + y1_triple - y2_triple) * s^3 + (y2_triple - y1_triple - y1_triple) * s^2 + y1_triple * s
end

--[[
    ������3���x�W�F�Ȑ����g�����C�[�W���O�֐�
    ����_��(0,0), (x1,y1), (x2,y2), ..., (xn,yn), (1,1)
    �����F
        t�F���Ԃ̊���(0 <= t <= 1)
        points�F����_(x1,y1,...,xn,yn)�̔z��
    �߂�l�F�o�͊����Bt=0�̂Ƃ�0�At=1�̂Ƃ�1
]]
local function multiCubicBezierEasing(t, points)
    if #points < 4 then
        return 0
    end
    local num_bezier = math.floor((#points - 4) / 6) + 1
    local bezier_index = 1
    for i = 2, num_bezier do
        if t < points[6 * i - 7] then
            break
        end
        bezier_index = bezier_index + 1
    end

    local point_index = 6 * bezier_index - 7
    local x0 = (bezier_index == 1) and 0 or points[point_index]
    local y0 = (bezier_index == 1) and 0 or points[point_index + 1]
    local x1 = points[point_index + 2]
    local y1 = points[point_index + 3]
    local x2 = points[point_index + 4]
    local y2 = points[point_index + 5]
    local x3 = (bezier_index == num_bezier) and 1 or points[point_index + 6]
    local y3 = (bezier_index == num_bezier) and 1 or points[point_index + 7]
    x0 = clip(x0, 0, 1)
    x3 = clip(x3, 0, 1)
    x1 = clip(x1, x0, x3)
    x2 = clip(x2, x0, x3)

    local dx, dy = x3 - x0, y3 - y0
    local ratio = cubicBezierEasing(
        (t - x0) / dx,
        (x1 - x0) / dx, (y1 - y0) / dy,
        (x2 - x0) / dx, (y2 - y0) / dy
    )
    ratio = ratio * dy + y0
    return ratio
end

--[[
    AviUtl�g���b�N�o�[�p
    �����F
        obj�FAviUtl�X�N���v�g��obj
        x1�F����_1��x���W(0 <= x1 <= 1)
        y1�F����_1��y���W
        x2�F����_2��x���W(0 <= x2 <= 1)
        y2�F����_2��y���W
    �߂�l�F
        �g���b�N�o�[�̌��ݒl
]]
local function trackbar(obj, x1, y1, x2, y2)
    local index, t = math.modf(obj.getpoint("index"))
    local ratio = cubicBezierEasing(t, x1, y1, x2, y2)
    local st = obj.getpoint(index)
    local ed = obj.getpoint(index + 1)
    return st + (ed - st) * ratio
end

--[[
    AviUtl�g���b�N�o�[�p�i�}���`�x�W�F�Ή��Łj
    �����F
        obj�FAviUtl�X�N���v�g��obj
        points�F����_(x1,y1,...,xn,yn)�̔z��
    �߂�l�F
        �g���b�N�o�[�̌��ݒl
]]
local function trackbarMultiBezier(obj, points)
    local index, t = math.modf(obj.getpoint("index"))
    local ratio = multiCubicBezierEasing(t, points)
    local st = obj.getpoint(index)
    local ed = obj.getpoint(index + 1)
    return st + (ed - st) * ratio
end

--[[
    AviUtl�g���b�N�o�[�p
    ���ԓ_���Ƃɕʂ̃}���`�x�W�F���g����
    ��`�����x�W�F�Ȑ��̐���蒆�ԓ_�̕��������ꍇ�̓x�W�G�Ȑ����J��Ԃ��g��
    �����F
        obj�FAviUtl�X�N���v�g��obj
        beziers�F�e���ԓ_�Ŏg���x�W�F��points
    �߂�l�F�g���b�N�o�[�̌��ݒl
]]
local function trackbarForEachKeyframe(obj, beziers)
    local index, t = math.modf(obj.getpoint("index"))
    local bezier_index = index % #beziers + 1
    local ratio = multiCubicBezierEasing(t, beziers[bezier_index])
    local st = obj.getpoint(index)
    local ed = obj.getpoint(index + 1)
    return st + (ed - st) * ratio
end

return {
    cbrt = cbrt,
    clip = clip,
    solveLinear = solveLinear,
    solveQuadratic = solveQuadratic,
    solveCubic = solveCubic,
    cubicBezierEasing = cubicBezierEasing,
    multiCubicBezierEasing = multiCubicBezierEasing,
    trackbar = trackbar,
    trackbarMultiBezier = trackbarMultiBezier,
    trackbarForEachKeyframe = trackbarForEachKeyframe,
}
