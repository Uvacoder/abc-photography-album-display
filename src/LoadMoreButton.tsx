import { h } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import styled from 'styled-components';

const Button = styled.button`
  background: transparent;
  color: var(--text-color-light);
  border: 1px solid var(--text-color-light);
  border-radius: 5px;
`;

const Container = styled.nav`
  width: 100%;
  display: flex;
  align-content: center;
  justify-content: center;
`;

export const LoadMoreButton = ({
  onVisible,
  onClick,
}: {
  onVisible?: () => unknown;
  onClick?: () => unknown;
}) => {
  const el = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    if (el.current !== null) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio) {
            setVisible(true);
            //observer.unobserve(entry.target);
          } else {
            setVisible(false);
          }
        });
      });
      observer.observe(el.current);
    }
  }, [el]);

  useEffect(() => {
    if (!visible) return;
    onVisible?.();
  }, [visible]);

  return (
    <Container>
      <Button ref={el} onClick={() => onClick?.()}>
        Load more
      </Button>
    </Container>
  );
};
