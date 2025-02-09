export const styles = `
.pe-finexp-widget-hidden {
  display: none !important;
}

.pe-finexp-checkout-wrapper {
  z-index: 1000;
  position: fixed;
  display: flex;
  justify-content: center;
  align-items: center;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(0,0,0,0.2);
}
.pe-finexp-checkout-wrapper-elem {
  position: absolute;
  background: #fff;
  box-shadow: 0px 2px 10px -2px rgba(0,0,0,0.65);
}


.pe-finexp-checkout-wrapper-asModal {
  align-items: center;
}
.pe-finexp-checkout-wrapper-asModal .pe-finexp-checkout-wrapper-elem {
  height: 90%;
  width: 90%;
  max-width: 800px;
  border-radius: 6px;
}
.pe-finexp-checkout-wrapper-asModal .pe-bootstrap .layout-app-header {
  border-radius: 6px 6px 0 0;
}
.pe-finexp-checkout-wrapper-asModal .pe-bootstrap .ui-layout-app {
  border-radius: 6px 6px 0 0;
}
.pe-finexp-checkout-wrapper-asModal .pe-bootstrap .ui-layout-app.static-block-view .inner-wrap {
  border-radius: 6px 6px 0 0 !important;
}
.pe-finexp-checkout-wrapper-asModal .pe-bootstrap .pe-checkout-wrapper-layout {
  border-radius: 6px 6px 0 0;
}


.pe-finexp-checkout-wrapper-top {
  align-items: flex-start;
}
.pe-finexp-checkout-wrapper-top .pe-finexp-checkout-wrapper-elem {
  height: 90%;
  width: 90%;
  max-width: 800px;
  border-radius: 0 0 6px 6px;
}


.pe-finexp-checkout-wrapper-leftSidebar {
  justify-content: flex-start;
}
.pe-finexp-checkout-wrapper-leftSidebar .pe-finexp-checkout-wrapper-elem {
  height: 100%;
  width: 100%;
  max-width: 450px;
}

.pe-finexp-checkout-wrapper-rightSidebar {
  justify-content: flex-end;
}
.pe-finexp-checkout-wrapper-rightSidebar .pe-finexp-checkout-wrapper-elem {
  height: 100%;
  width: 100%;
  max-width: 450px;
}


.pe-finexp-loading-dot-flashing {
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    padding: 24px 0;
    overflow: hidden;
    color: {COLOR_DOTS_1};
    max-width: {MAX_WIDTH};
}

.pe-finexp-loading-dot-flashing span {
  position: relative;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: inherit;
  color: inherit;
  animation: peFinexpLoadingDotFlashing 0.5s infinite linear alternate;
  animation-delay: .25s;
}

.pe-finexp-loading-dot-flashing span::before,
.pe-finexp-loading-dot-flashing span::after {
  content: '';
  display: inline-block;
  position: absolute;
  top: 0;
}

.pe-finexp-loading-dot-flashing span::before {
  left: -15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: inherit;
  color: inherit;
  animation: peFinexpLoadingDotFlashing 0.5s infinite alternate;
  animation-delay: 0s;
}

.pe-finexp-loading-dot-flashing span::after {
  left: 15px;
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: inherit;
  color: inherit;
  animation: peFinexpLoadingDotFlashing 0.5s infinite alternate;
  animation-delay: 0.5s;
}

@keyframes peFinexpLoadingDotFlashing {
  0% {
    background-color: {COLOR_DOTS_1};
  }
  50%,
  100% {
    background-color: {COLOR_DOTS_2};
  }
}


`;
