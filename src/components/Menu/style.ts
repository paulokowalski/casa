import styled from "styled-components";

export const ContainerMenu = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    width: 240px;
    
    -webkit-box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    -moz-box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3);
    z-index: 1200;
    
    @media (max-width: 900px) {
        position: absolute;
        left: -240px;
        transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        &.open {
            left: 0;
        }
    }
`

export default ContainerMenu;