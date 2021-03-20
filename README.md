# Gaming Button
AviUtl �ŃQ�[�~���O�{�^�����Č����邽�߂̃X�N���v�g�ł��B

## ���s��
�ȉ��̊��ł̎g�p��z�肵�Ă��܂��B
- AviUtl version 1.10
- �g���ҏWPlugin version 0.92

## �C���X�g�[��
AviUtl �g���ҏW�� script �t�H���_�Ɉȉ��̂��̂��R�s�[���܂��B
- `CubicBezierEasing` �t�H���_
- `CubicBezierEasing.lua`
- `@GamingButton.anm`

## �g����
1. �g���ҏW�^�C�����C����ɐ}�`�i�l�p�`�A�ԁj�ƃe�L�X�g�i���j��z�u
2. �O���[�v�����z�u���A�ȉ��̃A�j���[�V�������ʂ�K�p
    - �F���ω�@GamingButton
        - ���x�F�F�����ω����鑬�x
        - �I�t�Z�b�g�F���̃I�u�W�F�N�g�ɑ΂��ĐF�������炵�Ă���ω����������Ƃ��Ɏg��
    - �T�C�Y�ω�@GamingButton
        - ���x�F�I�u�W�F�N�g�̑傫�����ω����鑬�x
        - �g�嗦�F�ω��̓x�����B0�ɂ���ƕω����Ȃ��Ȃ�B

## 3���x�W�F�Ȑ��C�[�W���O
���Y���Ƃ��ăg���b�N�o�[��3���x�W�F�Ȑ����g����悤�ɂȂ�܂����B

�ȉ��̂悤�ȃC�[�W���O���g���b�N�o�[�X�N���v�g�A�܂��̓^�C�����C����̃e�L�X�g�I�u�W�F�N�g����ݒ�ł���悤�ɂȂ�܂��B
- 1�{��3���x�W�F�Ȑ����C�[�W���O�֐��Ɏg��
- ������3���x�W�F�Ȑ����Ȃ����Ȑ����C�[�W���O�֐��Ɏg��
- ���ԓ_���ƂɈႤ�Ȑ����C�[�W���O�֐��Ɏg��

### �g���b�N�o�[�X�N���v�g
[cubic-bezier.com](https://cubic-bezier.com/) ��
`doc/index.html`
�ɂ���x�W�G�Ȑ��G�f�B�^�Ȃǂ𗘗p���Ďg�������x�W�F�Ȑ�������������ȉ��̃T���v�������������Ă��D�݂̃X�N���v�g�t�@�C���i��F`@3���x�W�F�C�[�W���O.tra`�j�ɕۑ����܂��B
����������ӏ��͈ȉ��̒ʂ�ł��B
- 1�s��
    - `@ease`���D���Ȗ��O�ɕς���i��F`@�C�[�W���O`�j
- 2�s��
    - ���l `0.25, 0.1, 0.25, 1` ���D���Ȓl�ɕς���i��F`0.68, -0.6, 0.32, 1.6`�j
```lua
@ease
return require("CubicBezierEasing").trackbar(obj, 0.25, 0.1, 0.25, 1)
```

�����̃x�W�F�Ȑ����g���ĕ��G�ȃJ�[�u��\���������ꍇ�͈ȉ��̃T���v�����Q�l�ɂ��Ă��������B
```lua
@MultiBezierSample1
return require("CubicBezierEasing").trackbarMultiBezier(obj, {
    0.025, 0.144, 0.113, 0.194,  -- 1�{�ڂ̃x�W�F�Ȑ��̐���_
    0.304, 0.188,                -- 1�{�ڂ�2�{�ڂ̐ڑ��_
    0.319, 0.538, 0.661, 0.191,  -- 2�{�ڂ̃x�W�F�Ȑ��̐���_
    0.670, 0.594,                -- 2�{�ڂ�3�{�ڂ̐ڑ��_
    0.737, 0.098, 0.984, 0.442   -- 3�{�ڂ̃x�W�F�Ȑ��̐���_
})
```

���ԓ_���ƂɈႤ�x�W�F�Ȑ����g�������ꍇ�͈ȉ��̃T���v�����Q�l�ɂ��Ă��������B
```lua
@ForEachKeyframeSample1
return require("CubicBezierEasing").trackbarForEachKeyframe(obj, {
    {1, 0, 0, 1},   -- ��1���ԓ_�̃x�W�F�Ȑ�
    {0, 0, 1, 1},   -- ��2���ԓ_�̃x�W�F�Ȑ�
    {0, 1, 1, 0},   -- ��3���ԓ_�̃x�W�F�Ȑ�
})
```

### �e�L�X�g�I�u�W�F�N�g����ݒ�
�g���ҏW�̃^�C�����C����ɔz�u�����e�L�X�g�I�u�W�F�N�g�Ƀx�W�F�Ȑ��̐���_���X�g���L�q���A������Q�Ƃ��邱�ƂŃg���b�N�o�[�ɃC�[�W���O���|���邱�Ƃ��ł��܂��B
�菇�͈ȉ��̒ʂ�ł��B
1. �^�C�����C����Ƀe�L�X�g�I�u�W�F�N�g��z�u����B
2. �e�L�X�g�Ɉȉ��̂悤�ɋL�q����B
    ```lua
    <?
    b = {
      {1, 0, 0, 1},   -- ��1���ԓ_�̃x�W�F�Ȑ�
      {0, 0, 1, 1},   -- ��2���ԓ_�̃x�W�F�Ȑ�
      {0, 1, 1, 0},   -- ��3���ԓ_�̃x�W�F�Ȑ�
    }
    require("CubicBezierEasing").easings:set(obj, b)?>
    ```
3. �C�[�W���O���|�������I�u�W�F�N�g�̃g���b�N�o�[�Ɂu�e�L�X�g����@CBE_checker�v��K�p���A�ݒ�ɏ�q�̃e�L�X�g�I�u�W�F�N�g�̃��C���[�ԍ�����͂���B

### �����X�N���v�g����̈ڐA
AviUtl�̃g���b�N�o�[��3���x�W�F�Ȑ����g�����߂̑��̃X�N���v�g�Œ�`�����Ȑ���{�X�N���v�g�p�ɕϊ����邽�߂̃c�[���i`doc/index.html`�j��p�ӂ��܂����B
�Ή��X�N���v�g�͈ȉ��̒ʂ�ł��B
- �u�x�W�G�Ȑ��ɂ��O�������v�i�e�B�����j
- �u�}���`�x�W�F�O���v�i93���j

������g�����ƂŁA�Ȑ���ʂ̃v���W�F�N�g�Ŏg���܂킵���肷��̂��ȒP�ɂȂ�܂��B

### �T���v��
`@CBE_sample.tra` �ɃT���v���Ƃ��Ĉȉ��̃C�[�W���O���`���Ă���܂��B
- 3���x�W�F�Ȑ���1�{�g����
    - ease
    - ease-in
    - ease-out
    - ease-in-out
    - easeInSine
    - easeOutSine
    - easeInOutSine
    - easeInQuad
    - easeOutQuad
    - easeInOutQuad
    - easeInCubic
    - easeOutCubic
    - easeInOutCubic
    - easeInQuart
    - easeOutQuart
    - easeInOutQuart
    - easeInQuint
    - easeOutQuint
    - easeInOutQuint
    - easeInExpo
    - easeOutExpo
    - easeInOutExpo
    - easeInCirc
    - easeOutCirc
    - easeInOutCirc
    - easeInBack
    - easeOutBack
    - easeInOutBack
- 3���x�W�F�Ȑ��𕡐��{�g����
    - MultiBezierSample1
- ���ԓ_���ƂɈႤ�Ȑ����g����
    - ForEachKeyframeSample1

�����̃T���v���͈ȉ����Q�l�ɂ��܂����B
- [\<easing-function\> - CSS: �J�X�P�[�f�B���O�X�^�C���V�[�g | MDN](https://developer.mozilla.org/ja/docs/Web/CSS/easing-function)
- [�C�[�W���O�֐��`�[�g�V�[�g](https://easings.net/ja)
