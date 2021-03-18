local eps = 1e-9

--[[
    立方根を求める
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
    xをクリッピングする
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
    1次方程式を解く (a1 x + a0 = 0)
    引数：方程式の係数
    戻り値：解の配列
]]
local function solveLinear(a1, a0)
    local x = {}
    if math.abs(a1) > eps then
        x[1] = -a0 / a1
    end
    return x
end

--[[
    2次方程式の実数解を求める (a2 x^2 + a1 x + a0 = 0)
    引数：方程式の係数
    戻り値：解の配列
]]
local function solveQuadratic(a2, a1, a0)
    if math.abs(a2) < eps then
        return solveLinear(a1, a0)
    end

    local x = {}
    local a2_double = 2 * a2
    local discriminant = a1 * a1 - 4 * a2 * a0
    if math.abs(discriminant) < eps then
        -- 重解
        x[1] = -a1 / a2_double
    elseif discriminant > 0 then
        -- 異なる2実数解
        local disc_sqrt = math.sqrt(discriminant)
        x[1] = (-a1 - disc_sqrt) / a2_double
        x[2] = (-a1 + disc_sqrt) / a2_double
    end

    return x
end

--[[
    3次方程式の実数解を求める (a3 x^3 + a2 x^2 + a1 x + a0 = 0)
    引数：方程式の係数
    戻り値：解の配列
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
        -- 実数の重解を持つ場合
        local q_half_cbrt = cbrt(q_half)
        x[1] = -2 * q_half_cbrt - A_div3
        x[2] = q_half_cbrt - A_div3
    elseif discriminant > 0 then
        -- 1個の実数解
        local disc_sqrt = math.sqrt(discriminant)
        x[1] = cbrt(-q_half + disc_sqrt) + cbrt(-q_half - disc_sqrt) - A_div3
    else
        -- 異なる3実数解
        local a = 2 * math.sqrt(-p_div3)
        local theta = math.atan2(math.sqrt(-discriminant), -q_half) / 3
        x[1] = a * math.cos(theta) - A_div3
        x[2] = a * math.cos(theta + math.pi * 2 / 3) - A_div3
        x[3] = a * math.cos(theta - math.pi * 2 / 3) - A_div3
    end

    return x
end

--[[
    3次ベジェ曲線を使ったイージング関数
    始点は(0, 0)、終点は(1, 1)、制御点が(x1, y1), (x2, y2)
    引数：
        t：時間の割合(0 <= t <= 1)
        x1：制御点1のx座標(0 <= x1 <= 1)
        y1：制御点1のy座標
        x2：制御点2のx座標(0 <= x2 <= 1)
        y2：制御点2のy座標
    戻り値：出力割合。t=0のとき0、t=1のとき1
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
    複数の3次ベジェ曲線を使ったイージング関数
    制御点は(0,0), (x1,y1), (x2,y2), ..., (xn,yn), (1,1)
    引数：
        t：時間の割合(0 <= t <= 1)
        points：制御点(x1,y1,...,xn,yn)の配列
    戻り値：出力割合。t=0のとき0、t=1のとき1
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
    AviUtlトラックバー用
    引数：
        obj：AviUtlスクリプトのobj
        x1：制御点1のx座標(0 <= x1 <= 1)
        y1：制御点1のy座標
        x2：制御点2のx座標(0 <= x2 <= 1)
        y2：制御点2のy座標
    戻り値：
        トラックバーの現在値
]]
local function trackbar(obj, x1, y1, x2, y2)
    local index, t = math.modf(obj.getpoint("index"))
    local ratio = cubicBezierEasing(t, x1, y1, x2, y2)
    local st = obj.getpoint(index)
    local ed = obj.getpoint(index + 1)
    return st + (ed - st) * ratio
end

--[[
    AviUtlトラックバー用（マルチベジェ対応版）
    引数：
        obj：AviUtlスクリプトのobj
        points：制御点(x1,y1,...,xn,yn)の配列
    戻り値：
        トラックバーの現在値
]]
local function trackbarMultiBezier(obj, points)
    local index, t = math.modf(obj.getpoint("index"))
    local ratio = multiCubicBezierEasing(t, points)
    local st = obj.getpoint(index)
    local ed = obj.getpoint(index + 1)
    return st + (ed - st) * ratio
end

--[[
    AviUtlトラックバー用
    中間点ごとに別のマルチベジェを使える
    定義したベジェ曲線の数より中間点の方が多い場合はベジエ曲線を繰り返し使う
    引数：
        obj：AviUtlスクリプトのobj
        beziers：各中間点で使うベジェのpoints
    戻り値：トラックバーの現在値
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
