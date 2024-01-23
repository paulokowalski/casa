import React from 'react';
import { Container } from './styles';

interface CardProps {
    title: string;
    content: string;
  }

const Card: React.FC<CardProps> = ({ title, content }) => {
    return (
        <Container>
            <div style={{ border: '1px solid #ccc', padding: '16px', margin: '16px', borderRadius: '8px' }}>
                <h3>{title}</h3>
                <p>{content}</p>
            </div>
        </Container>
    )
}
export default Card;