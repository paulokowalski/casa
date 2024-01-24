import React from 'react';
import { Container } from './styles';

interface CardProps {
    title: string;
    content: string;
    className: string;
  }

const Card: React.FC<CardProps> = ({ title, content, className }) => {
    return (
        <Container>
            <div style={{ border: '1px solid #ccc', padding: '16px', margin: '16px', borderRadius: '8px' }} className={className}>
                <h3>{title}</h3>
                <p>{content}</p>
            </div>
        </Container>
    )
}
export default Card;