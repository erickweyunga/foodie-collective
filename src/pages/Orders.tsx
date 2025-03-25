
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { FileText, Copy, Clipboard, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface OrderItem {
  id: string;
  name: string;
  items: string[];
  timestamp: string;
}

interface FoodCount {
  [key: string]: number;
}

const Orders = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [foodCounts, setFoodCounts] = useState<FoodCount>({});
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('timestamp', { ascending: false });
      
      if (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to load orders. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      if (data) {
        setOrders(data as OrderItem[]);
        updateFoodCounts(data as OrderItem[]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateFoodCounts = (orderData: OrderItem[]) => {
    // Calculate food counts
    const counts: FoodCount = {};
    orderData.forEach(order => {
      order.items.forEach(item => {
        counts[item] = (counts[item] || 0) + 1;
      });
    });
    
    setFoodCounts(counts);
  };

  useEffect(() => {
    fetchOrders();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          const newOrder = payload.new as OrderItem;
          
          // Add new order to the list
          setOrders(prevOrders => [newOrder, ...prevOrders]);
          
          // Update food counts with the new order
          setFoodCounts(prevCounts => {
            const newCounts = { ...prevCounts };
            newOrder.items.forEach(item => {
              newCounts[item] = (newCounts[item] || 0) + 1;
            });
            return newCounts;
          });

          // Show notification for new order
          toast({
            title: "New Order Received",
            description: `${newOrder.name} just placed an order`,
          });
        }
      )
      .subscribe();   

    // Cleanup function to remove channel subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

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

  const copySummaryToClipboard = () => {
    let text = "Neurotech.Africa - Muhtasari wa Chakula\n\n";
    
    Object.entries(foodCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .forEach(([item, count]) => {
        text += `${item} ${count}\n`;
      });
    
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Food summary has been copied to your clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Failed to copy",
          description: "Could not copy summary to clipboard",
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
            Orders update in real-time as they are submitted
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button 
              onClick={copyOrdersToClipboard}
              disabled={orders.length === 0}
            >
              <Copy className="mr-2 h-4 w-4" /> Copy All Orders
            </Button>
            
            <Button 
              onClick={copySummaryToClipboard}
              disabled={orders.length === 0}
              variant="secondary"
            >
              <Clipboard className="mr-2 h-4 w-4" /> Copy Food Summary
            </Button>

            <Button
              onClick={fetchOrders}
              variant="outline"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        </motion.div>

        {/* Food Summary Section */}
        {Object.keys(foodCounts).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-morphism rounded-xl p-6 mb-8"
          >
            <h2 className="text-xl font-bold mb-4 text-center">Muhtasari wa Chakula</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(foodCounts)
                .sort(([, countA], [, countB]) => countB - countA)
                .map(([item, count]) => (
                  <div key={item} className="flex justify-between items-center p-3 border rounded-lg bg-background/50">
                    <span>{item}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="text-center p-8">
            <div className="animate-spin mx-auto h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-4"></div>
            <p>Loading orders...</p>
          </div>
        ) : orders.length > 0 ? (
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
                {orders.map((order) => (
                  <TableRow key={order.id}>
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
              When people submit their orders, they will appear here in real-time.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
