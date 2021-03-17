# Gaming Button
AviUtl �ŃQ�[�~���O�{�^�����Č����邽�߂̃X�N���v�g�ł��B

## ���s��
�ȉ��̊��ł̎g�p��z�肵�Ă��܂��B
- AviUtl version 1.10
- �g���ҏWPlugin version 0.92

## �C���X�g�[��
AviUtl �g���ҏW�� script �t�H���_�Ɉȉ��̃t�@�C�����R�s�[���܂��B
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
�g������Ƃ��Ă� CSS �� `cubic-bezier(x1, y1, x2, y2)` �Ǝ����悤�Ȋ����ł��B

�n�_�� (0, 0)�A�I�_�� (1, 1)�A����_1�A2�� (x1, y1)�A(x2, y2)
�Ƃ���3���x�W�F�Ȑ��ɉ����悤�ȃg���b�N�o�[�p�X�N���v�g���ȒP�ɏ�����悤�ɂȂ�܂��B

### �T���v��
`@CBE.tra` ���g���ҏW�� script �t�H���_�ɃR�s�[����ƈȉ��̃C�[�W���O���g���b�N�o�[�Ŏg����悤�ɂȂ�܂��B
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

�����̃T���v���͈ȉ����Q�l�ɂ��܂����B
- [\<easing-function\> - CSS: �J�X�P�[�f�B���O�X�^�C���V�[�g | MDN](https://developer.mozilla.org/ja/docs/Web/CSS/easing-function)
- [�C�[�W���O�֐��`�[�g�V�[�g](https://easings.net/ja)

### �J�X�^�}�C�Y
[cubic-bezier.com](https://cubic-bezier.com/)
�Ȃǂ𗘗p���Ďg�������x�W�F�Ȑ�������������ȉ��̃T���v�������������Ă��D�݂̃X�N���v�g�t�@�C���i��F`@3���x�W�F�C�[�W���O.tra`�j�ɕۑ����܂��B
����������ӏ��͈ȉ��̒ʂ�ł��B
- 1�s��
    - `@ease`���D���Ȗ��O�ɕς���i��F`@�C�[�W���O`�j
- 2�s��
    - ���l `0.25, 0.1, 0.25, 1` ���D���Ȓl�ɕς���i��F`0.68, -0.6, 0.32, 1.6`�j
```lua
@ease
return require("CubicBezierEasing").trackbar(obj, 0.25, 0.1, 0.25, 1)
```
