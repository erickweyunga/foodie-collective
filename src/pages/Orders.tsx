
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OrderItem {
  name: string;
  items: string[];
  timestamp: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Get all orders from localStorage
    const allOrders: OrderItem[] = [];
    
    // In a real application, this would come from a database
    // For now, we'll use localStorage and look for all keys that match our format
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('neurotech-order')) {
        try {
          const orderData = JSON.parse(localStorage.getItem(key) || '');
          allOrders.push(orderData);
        } catch (e) {
          // Skip invalid entries
        }
      }
    }
    
    // Sort orders by timestamp, newest first
    allOrders.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    setOrders(allOrders);
  }, []);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const copyOrdersToClipboard = () => {
    let text = "Neurotech.Africa - Food Orders\n\n";
    
    orders.forEach((order, index) => {
      text += `${index + 1}. ${order.name} - ${formatDate(order.timestamp)}\n`;
      text += `   Items: ${order.items.join(', ')}\n\n`;
    });
    
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "All orders have been copied to your clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Could not copy orders to clipboard",
          variant: "destructive",
        });
      });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold mb-4">All Food Orders</h1>
          <p className="text-muted-foreground mb-6">
            Here's a list of all submitted orders that can be copied and sent as needed
          </p>
          
          <Button 
            onClick={copyOrdersToClipboard}
            className="mb-8"
            disabled={orders.length === 0}
          >
            <Copy className="mr-2 h-4 w-4" /> Copy All Orders
          </Button>
        </motion.div>

        {orders.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="glass-morphism rounded-xl p-6 overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{order.name}</TableCell>
                    <TableCell>
                      <ul className="list-disc pl-5">
                        {order.items.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>{formatDate(order.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        ) : (
          <div className="text-center p-8 border rounded-lg bg-muted/10">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Orders Yet</h3>
            <p className="text-muted-foreground">
              When people submit their orders, they will appear here.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
